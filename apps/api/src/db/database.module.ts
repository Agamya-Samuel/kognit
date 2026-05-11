import { Global, Module, Provider } from '@nestjs/common';
import { DatabaseService } from './connection';
import { DrizzleDB } from './connection';

// Injection token for the Drizzle DB instance
export const DRIZZLE_DB = Symbol('DRIZZLE_DB');

const dbProvider: Provider = {
  provide: DRIZZLE_DB,
  useFactory: (databaseService: DatabaseService) => {
    return databaseService.getConnection();
  },
  inject: [DatabaseService],
};

@Global()
@Module({
  providers: [DatabaseService, dbProvider],
  exports: [DatabaseService, DRIZZLE_DB],
})
export class DatabaseModule {}
