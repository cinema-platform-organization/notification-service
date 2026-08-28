import { z } from "zod";

export enum Enviroment {
	Development = "development",
	Production = "production",
	Test = "test",
}

export default z.object({
	NODE_ENV: z.enum(Enviroment).default(Enviroment.Development),
	RMQ_URL: z.string().nonempty(),
	RMQ_QUEUE: z.string().nonempty(),
});
