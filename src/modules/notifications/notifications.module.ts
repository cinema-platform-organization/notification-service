import { Module } from "@nestjs/common";

import { MailModule } from "@/infrastructure/mail/mail.module";
import { SmsModule } from "@/infrastructure/sms/sms.module";

import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
	imports: [MailModule, SmsModule],
	controllers: [NotificationsController],
	providers: [NotificationsService],
})
export class NotificationsModule {}
