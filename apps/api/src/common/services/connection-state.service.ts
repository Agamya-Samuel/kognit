import { Injectable, Logger } from "@nestjs/common";

export interface DependencyHealth {
  database: "up" | "down";
  redis: "up" | "down";
}

@Injectable()
export class ConnectionStateService {
  private readonly logger = new Logger(ConnectionStateService.name);
  private _databaseUp = false;
  private _redisUp = false;

  setDatabaseState(up: boolean) {
    const previous = this._databaseUp;
    this._databaseUp = up;
    if (previous !== up) {
      this.logger.warn(
        `Database connection state changed: ${up ? "UP" : "DOWN"}`,
      );
    }
  }

  setRedisState(up: boolean) {
    const previous = this._redisUp;
    this._redisUp = up;
    if (previous !== up) {
      this.logger.warn(`Redis connection state changed: ${up ? "UP" : "DOWN"}`);
    }
  }

  get databaseUp() {
    return this._databaseUp;
  }

  get redisUp() {
    return this._redisUp;
  }

  get isFullyHealthy() {
    return this._databaseUp && this._redisUp;
  }

  getHealth(): DependencyHealth {
    return {
      database: this._databaseUp ? "up" : "down",
      redis: this._redisUp ? "up" : "down",
    };
  }
}
