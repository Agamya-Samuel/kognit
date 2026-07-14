import { Global, Module, Provider } from "@nestjs/common";
import { DatabaseService, createLazyDB } from "./connection";
import { ConnectionStateService } from "../common/services/connection-state.service";

export const DRIZZLE_DB = Symbol("DRIZZLE_DB");

const dbProvider: Provider = {
  provide: DRIZZLE_DB,
  useFactory: (service: DatabaseService) => createLazyDB(service),
  inject: [DatabaseService],
};

@Global()
@Module({
  providers: [DatabaseService, ConnectionStateService, dbProvider],
  exports: [DatabaseService, ConnectionStateService, DRIZZLE_DB],
})
export class DatabaseModule {}
