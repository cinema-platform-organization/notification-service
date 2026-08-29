import type { MailerOptions } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

export function getMailerConfig(configService: ConfigService): MailerOptions {
	return {
		transport: {
			host: configService.getOrThrow<string>("smtp.host"),
			port: configService.getOrThrow<number>("smtp.port"),
			auth: {
				user: configService.getOrThrow<string>("smtp.username"),
				pass: configService.getOrThrow<string>("smtp.password"),
			},
			secure: configService.getOrThrow<boolean>("smtp.secure"),
		},
		defaults: {
			from: `Cinema Platform ${configService.getOrThrow<string>("smtp.fromAddress")}`,
		},
	};
}
