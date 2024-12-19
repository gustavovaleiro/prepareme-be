import { Model } from 'mongoose';
import { Question } from '../../../../domain/entities/Question';
import { QuestionRepository } from '../../../../domain/repositories/QuestionRepository';

export class MongoQuestionRepository implements QuestionRepository {
  constructor(private readonly model: Model<Question>) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.model.findById(id);
    return question ? question.toObject() : null;
  }

  async findByRoleAndLevel(role: string, level: string): Promise<Question[]> {
    const questions = await this.model.find({
      roles: role,
      difficulty: level
    });
    return questions.map(q => q.toObject());
  }

  async create(question: Partial<Question>): Promise<Question> {
    const created = await this.model.create(question);
    return created.toObject();
  }

  async update(id: string, question: Partial<Question>): Promise<Question | null> {
    const updated = await this.model.findByIdAndUpdate(id, question, { new: true });
    return updated ? updated.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}