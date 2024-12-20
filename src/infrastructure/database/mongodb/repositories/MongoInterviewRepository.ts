import { Model } from 'mongoose';
import { Interview } from '../../../../domain/entities/Interview';
import { InterviewRepository } from '../../../../domain/repositories/InterviewRepository';
import { DatabaseError } from '../../../errors/ApplicationError';
import { createLogger } from '../../../logging/Logger';

const logger = createLogger('MongoInterviewRepository');

export class MongoInterviewRepository implements InterviewRepository {
  constructor(private readonly model: Model<Interview>) {}

  async create(interview: Partial<Interview>): Promise<Interview> {
    try {
      const created = await this.model.create(interview);
      return created.toObject();
    } catch (error) {
      logger.error('Failed to create interview', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to create interview');
    }
  }

  async findById(id: string): Promise<Interview | null> {
    try {
      const interview = await this.model.findOne({ id });
      return interview ? interview.toObject() : null;
    } catch (error) {
      logger.error('Failed to find interview', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to find interview');
    }
  }

  async update(id: string, interview: Partial<Interview>): Promise<Interview | null> {
    try {
      const updated = await this.model.findOneAndUpdate(
        { id },
        { $set: interview },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    } catch (error) {
      logger.error('Failed to update interview', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to update interview');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findOneAndDelete({ id });
      return !!result;
    } catch (error) {
      logger.error('Failed to delete interview', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to delete interview');
    }
  }

  async findByUserId(userId: string): Promise<Interview[]> {
    try {
      const interviews = await this.model.find({ userId });
      return interviews.map(i => i.toObject());
    } catch (error) {
      logger.error('Failed to find interviews by user', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to find interviews by user');
    }
  }
}