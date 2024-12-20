import { Model } from 'mongoose';
import { Question } from '../../../../domain/entities/Question';
import { QuestionRepository } from '../../../../domain/repositories/QuestionRepository';
import { DatabaseError } from '../../../errors/ApplicationError';
import { createLogger } from '../../../logging/Logger';

const logger = createLogger('MongoQuestionRepository');

export class MongoQuestionRepository implements QuestionRepository {
  constructor(private readonly model: Model<Question>) {}

  async findById(id: string): Promise<Question | null> {
    try {
      const question = await this.model.findOne({ id });
      return question ? question.toObject() : null;
    } catch (error) {
      logger.error('Failed to find question', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to find question');
    }
  }

  async findByRoleAndLevel(role: string, level: string, language: string): Promise<Question[]> {
    try {
      const questions = await this.model.find({
        roles: role,
        difficulty: level,
        language
      });
      return questions.map(q => q.toObject());
    } catch (error) {
      logger.error('Failed to find questions', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to find questions');
    }
  }

  async create(question: Partial<Question>): Promise<Question> {
    try {
      const created = await this.model.create(question);
      return created.toObject();
    } catch (error) {
      logger.error('Failed to create question', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to create question');
    }
  }

  async update(id: string, question: Partial<Question>): Promise<Question | null> {
    try {
      const updated = await this.model.findOneAndUpdate(
        { id },
        { $set: question },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    } catch (error) {
      logger.error('Failed to update question', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to update question');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findOneAndDelete({ id });
      return !!result;
    } catch (error) {
      logger.error('Failed to delete question', error instanceof Error ? error : new Error('Unknown error'));
      throw new DatabaseError('Failed to delete question');
    }
  }
}