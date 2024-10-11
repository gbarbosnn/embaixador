import { z } from "zod";
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
	PORT: z.coerce.number().default(3333),  
	DATABASE_URL: z.string(),  
	PAGARME_API_URL: z.string().url(),  
	PAGARME_API_USERNAME: z.string(),  
	BLING_API_CLIENT_ID: z.string(),
	BLING_API_CLIENT_SECRET: z.string(),
	BLING_API_BASE_URL_TOKEN: z.string().url(),  
	BLING_API_BASE64_AUTH: z.string(),
	BLING_USER: z.string(),
	BLING_PASSWORD: z.string(),
})

export const env = envSchema.parse(process.env)

