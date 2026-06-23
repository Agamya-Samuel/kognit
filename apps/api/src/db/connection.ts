import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';

export type DrizzleDB = ReturnType<typeof drizzle>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client: postgres.Sql | null = null;
  public db: DrizzleDB | null = null;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    try {
      this.client = postgres(connectionString, {
        max: 10,
        idle_timeout: 30,
        connect_timeout: 5,
        // NOTE: postgres.js auto-scales connections (no `min` option).
        // MED-04 finding applies to pg-pool, not postgres.js.
        onnotice: (notice) => this.logger.debug(`PostgreSQL notice: ${notice.message}`),
        // statement_timeout: abort any query that runs longer than 30s.
        // Prevents slow queries from holding connections indefinitely.
        // The option is supported at runtime by postgres.js but not in its TS types.
        statement_timeout: 30_000,
      } as Parameters<typeof postgres>[1]);

      this.db = drizzle(this.client);
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async closeConnection() {
    if (this.client) {
      await this.client.end();
      this.logger.log('Database connection closed gracefully');
      this.client = null;
      this.db = null;
    }
  }

  public getConnection() {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }
    return this.db;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client?.unsafe('SELECT 1 as health');
      return !!result;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
