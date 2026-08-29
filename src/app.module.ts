import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import configuration from "./config/configuration";
import { RmqModule } from "./infrastructure/rmq/rmq.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { MailModule } from './infrastructure/mail/mail.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			expandVariables: true,
		}),
		RmqModule,
		NotificationsModule,
		MailModule,
	],
})
export class AppModule {}
