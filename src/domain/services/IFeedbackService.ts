import { Answer } from '../entities/Interview';

export interface FeedbackResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export interface IFeedbackService {
  analyzeFeedback(answers: Answer[], expectedAnswers: Record<string, string>): Promise<FeedbackResult>;
}