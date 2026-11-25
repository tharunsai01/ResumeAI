import { z } from 'zod';
import { APPLICATION_STATUS } from '../constants/enums';
import { objectIdSchema } from './recordId.validators';

export const createApplicationSchema = z.object({
  jobId: objectIdSchema,
  resumeId: objectIdSchema.optional(),
  coverLetter: z.string().trim().max(3000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUS),
  note: z.string().trim().max(500).optional(),
});

const noteText = z.string().trim().min(1).max(500);

export const addApplicationNoteSchema = z.union([
  z.object({ note: noteText }),
  z.object({ notes: noteText }).transform(({ notes }) => ({ note: notes })),
]);

export const withdrawApplicationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type WithdrawApplicationInput = z.infer<typeof withdrawApplicationSchema>;
