import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { ConnectionStateService } from "../common/services/connection-state.service";
import { retryBackoffMs } from "./backoff";

export type DrizzleDB = ReturnType<typeof drizzle>;

function dbDisconnectedError(prop: string | symbol): Error {
  return new Error(
    `Database not connected — "${String(prop)}" cannot be used until the service has reconnected`,
  );
}

export function createLazyDB(service: DatabaseService): DrizzleDB {
  const sp: Set<string | symbol> = new Set();
  const NESTJS_INTERNAL = new Set([
    "then",
    "constructor",
    Symbol.toStringTag,
    Symbol.iterator,
    "onModuleInit",
    "onModuleDestroy",
    "onApplicationBootstrap",
    "onApplicationShutdown",
    "beforeApplicationShutdown",
  ]);

  const handler: ProxyHandler<any> = {
    get(_, prop: string | symbol) {
      if (NESTJS_INTERNAL.has(prop as string)) return undefined;
      if (Symbol.for("nodejs.util.inspect.custom") === prop) return undefined;
      const db = service.getConnection();
      if (!db) {
        service.reconnect().catch(() => {});
        return (...args: unknown[]) => {
          throw dbDisconnectedError(prop);
        };
      }
      const value = (db as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function" && !sp.has(prop)) {
        sp.add(prop);
        return value.bind(db);
      }
      return value;
    },
    set() {
      throw dbDisconnectedError("<assignment>");
    },
    ownKeys() {
      const db = service.getConnection();
      if (!db) return [];
      return Reflect.ownKeys(db as object);
    },
    getOwnPropertyDescriptor(_, prop: string | symbol) {
      const db = service.getConnection();
      if (!db) return undefined;
      return Object.getOwnPropertyDescriptor(db as object, prop as string);
    },
    defineProperty() {
      throw dbDisconnectedError("<defineProperty>");
    },
    has(_, prop: string | symbol) {
      if (NESTJS_INTERNAL.has(prop as string)) return false;
      const db = service.getConnection();
      if (!db) return false;
      return prop in (db as unknown as object);
    },
  };

  return new Proxy({}, handler) as unknown as DrizzleDB;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client: postgres.Sql | null = null;
  public db: DrizzleDB | null = null;
  private connectionAttempt = 0;
  private shuttingDown = false;
  private isReconnecting = false;

  constructor(private readonly connectionStateService: ConnectionStateService) {
    this.logger.log(
      "DatabaseService initialized — deferred connection; will connect in onModuleInit",
    );
  }

  async onModuleInit() {
    this.connectWithRetry().catch((error) => {
      this.logger.error(
        `Background reconnection startup failed unexpectedly: ${error.message}`,
      );
      if (!this.shuttingDown) {
        setTimeout(
          () =>
            this.connectWithRetry().catch(this.logger.error.bind(this.logger)),
          5000,
        );
      }
    });
  }

  private async connectWithRetry(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      this.logger.error("DATABASE_URL environment variable is not set");
      this.connectionStateService.setDatabaseState(false);
      return;
    }

    while (true) {
      if (this.shuttingDown) {
        this.logger.warn(
          "Database connection shutdown requested — aborting retry loop",
        );
        return;
      }
      this.connectionAttempt++;
      const delayMs = retryBackoffMs(this.connectionAttempt);

      try {
        await this.initializeConnection(connectionString);
        this.connectionStateService.setDatabaseState(true);
        this.logger.log("Database connection established successfully");
        this.connectionAttempt = 0;
        return;
      } catch (error) {
        this.logger.error(
          `Database connection attempt #${this.connectionAttempt} failed: ${error.message}`,
        );
        await this.cleanupConnection();
        this.connectionStateService.setDatabaseState(false);
        this.logger.warn(`Retrying database connection in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  private async initializeConnection(connectionString: string): Promise<void> {
    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 5,
      onnotice: (notice) =>
        this.logger.debug(`PostgreSQL notice: ${notice.message}`),
      statement_timeout: 30_000,
    } as Parameters<typeof postgres>[1]);

    try {
      await client.unsafe("SELECT 1 as health_check");
    } catch (error) {
      await client.end();
      throw new Error(`Database health check failed: ${error.message}`, {
        cause: error,
      });
    }

    const db = drizzle(client);
    this.client = client;
    this.db = db;
  }

  async onModuleDestroy() {
    this.shuttingDown = true;
    await this.cleanupConnection();
    this.connectionStateService.setDatabaseState(false);
    this.logger.log("DatabaseService destroyed");
  }

  private async cleanupConnection() {
    if (this.client) {
      try {
        await this.client.end();
      } catch (error) {
        this.logger.warn(
          `Error while closing database connection: ${error.message}`,
        );
      } finally {
        this.client = null;
        this.db = null;
      }
    }
  }

  public getConnection(): DrizzleDB | null {
    return this.db;
  }

  public requireConnection(): DrizzleDB {
    if (!this.db) {
      throw new Error(
        "Database connection not initialized — service is unavailable or still connecting",
      );
    }
    return this.db;
  }

  public isConnected(): boolean {
    return this.db !== null && this.client !== null;
  }

  public async reconnect(): Promise<void> {
    if (this.isReconnecting) {
      this.logger.debug("Database reconnection already in progress — skipping");
      return;
    }
    if (this.isConnected()) {
      this.logger.log("Database already connected — skipping reconnect");
      return;
    }
    this.isReconnecting = true;
    this.connectionAttempt = 0;
    try {
      await this.connectWithRetry();
    } finally {
      this.isReconnecting = false;
    }
  }

  public async healthCheck(): Promise<boolean> {
    if (!this.isConnected()) {
      this.reconnect().catch((error) => {
        this.logger.error(
          `Database reconnection triggered by health check failed: ${error.message}`,
        );
      });
      return false;
    }
    try {
      const result = await this.client!.unsafe("SELECT 1 as health_check");
      return !!result;
    } catch (error) {
      this.logger.error("Database health check failed", error);
      this.connectionStateService.setDatabaseState(false);
      this.reconnect().catch((error) => {
        this.logger.error(
          `Database reconnection triggered by health check failed: ${error.message}`,
        );
      });
      return false;
    }
  }
}
