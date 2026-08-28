import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { RmqModule } from "./infrastructure/rmq/rmq.module";

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), RmqModule],
})
export class AppModule {}
