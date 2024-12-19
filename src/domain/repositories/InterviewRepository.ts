import { Interview } from '../entities/Interview';

export interface InterviewRepository {
  create(interview: Partial<Interview>): Promise<Interview>;
  findById(id: string): Promise<Interview | null>;
  update(id: string, interview: Partial<Interview>): Promise<Interview | null>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<Interview[]>;
}