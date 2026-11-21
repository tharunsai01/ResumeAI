import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test','production']).default('development'),
	PORT: z.coerce.number().int().positive().default(5000),
	MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
	CLIENT_URL: z.string().url().default('http://localhost:5173'),
	JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
        JWT_ACCESS_MINUTES: z.coerce.number().int().positive().default(15),
        JWT_REFRESH_DAYS: z.coerce.number().int().positive().default(7),
	SMTP_HOST: z.string().optional(),
        SMTP_PORT: z.coerce.number().int().positive().default(587),
        SMTP_USER: z.string().optional(),
        SMTP_PASS: z.string().optional(),
        EMAIL_FROM: z.string().default('HireSmart AI <no-reply@hiresmart.local>'),
        GOOGLE_CLIENT_ID: z.string().optional(),
	UPLOAD_DIR: z.string().default('uploads'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
	console.error('Invalid enviroment variables:');
	console.error(parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production' ;

