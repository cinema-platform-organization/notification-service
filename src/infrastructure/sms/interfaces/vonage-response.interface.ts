import { VonageSmsMessage } from "./vonage-message.interface";

export interface VonageSmsResponse {
	"message-count": string;
	messages: VonageSmsMessage[];
}
