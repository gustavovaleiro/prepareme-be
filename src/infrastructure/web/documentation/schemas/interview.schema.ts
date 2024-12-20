import { z } from 'zod';

export const InterviewRequestSchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  userNumber: z.string(),
  interviewLanguage: z.string(),
  role: z.string(),
  level: z.string()
});

export const AnswerSubmissionSchema = z.object({
  questionId: z.string().uuid(),
  content: z.string().min(1)
});

export const SubmitAnswersRequestSchema = z.object({
  interviewId: z.string().uuid(),
  answers: z.array(AnswerSubmissionSchema)
});

export type InterviewRequest = z.infer<typeof InterviewRequestSchema>;
export type SubmitAnswersRequest = z.infer<typeof SubmitAnswersRequestSchema>;