import { Question } from '../entities/Question';

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByRoleAndLevel(role: string, level: string): Promise<Question[]>;
  create(question: Partial<Question>): Promise<Question>;
  update(id: string, question: Partial<Question>): Promise<Question | null>;
  delete(id: string): Promise<boolean>;
}