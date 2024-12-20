import { z } from 'zod';
import { QuestionDifficulty } from '../entities/Question';

export const QuestionResponseSchema = z.object({
  content: z.string().min(10).max(1000),
  category: z.string().min(3).max(100),
  difficulty: z.enum([
    QuestionDifficulty.BEGINNER,
    QuestionDifficulty.INTERMEDIATE,
    QuestionDifficulty.ADVANCED
  ]),
  keywords: z.array(z.string()).min(1).max(10),
});

export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;