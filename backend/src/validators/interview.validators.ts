import { z } from 'zod';
import { INTERVIEW_MODES } from '../constants/enums';

const meetingLink = z.string().trim().max(2048).url().refine(
  value => /^https?:\/\//i.test(value),
  'Use an HTTP or HTTPS meeting link',
);

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().regex(/^[a-f\d]{24}$/i),
  scheduledAt: z.string().datetime({ offset: true }),
  durationMins: z.number().int().min(5).max(480).optional(),
  mode: z.enum(INTERVIEW_MODES).optional(),
  meetingLink: meetingLink.optional(),
  location: z.string().trim().max(500).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  interviewer: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});
