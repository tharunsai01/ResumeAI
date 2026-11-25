import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid record ID');
export const recordIdParamSchema = z.object({ id: objectIdSchema });
export const jobIdParamSchema = z.object({ jobId: objectIdSchema });
