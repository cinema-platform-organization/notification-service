import { ConfigService } from "@nestjs/config";
import { Auth } from "@vonage/auth";

export function getVonageAuth(configService: ConfigService): Auth {
	return new Auth({
		apiKey: configService.getOrThrow<string>("vonage.apiKey"),
		apiSecret: configService.getOrThrow<string>("vonage.apiSecret"),
	});
}
