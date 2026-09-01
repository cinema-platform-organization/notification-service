import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import configuration from "./config/configuration";
import { MailModule } from "./infrastructure/mail/mail.module";
import { RmqModule } from "./infrastructure/rmq/rmq.module";
import { SmsModule } from "./infrastructure/sms/sms.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			expandVariables: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				".env",
			],
		}),
		RmqModule,
		NotificationsModule,
		MailModule,
		SmsModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				apiKey: configService.getOrThrow<string>("vonage.apiKey"),
				apiSecret: configService.getOrThrow<string>("vonage.apiSecret"),
				fromName: configService.getOrThrow<string>("vonage.fromName"),
			}),
			inject: [ConfigService],
		}),
	],
})
export class AppModule {}
