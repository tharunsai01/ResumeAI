import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test','production']).default('development'),
	PORT: z.coerce.number().int().positive().default(5000),
	MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
	CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
	console.error('Invalid enviroment variables:');
	console.error(parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production' ;

