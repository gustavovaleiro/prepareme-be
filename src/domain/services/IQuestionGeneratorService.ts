import { Question } from '../entities/Question';

export interface IQuestionGeneratorService {
  generateQuestions(role: string, level: string, language: string): Promise<Question[]>;
}