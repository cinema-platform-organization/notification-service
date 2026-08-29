export interface VonageSmsMessage {
	to: string;
	status: string;
	"message-id"?: string;
	"remaining-balance"?: string;
	"message-price"?: string;
	network?: string;
	"error-text"?: string;
	"client-ref"?: string;
}
