import { Model } from 'mongoose';
import { Interview } from '../../../../domain/entities/Interview';
import { InterviewRepository } from '../../../../domain/repositories/InterviewRepository';

export class MongoInterviewRepository implements InterviewRepository {
  constructor(private readonly model: Model<Interview>) {}

  async create(interview: Partial<Interview>): Promise<Interview> {
    const created = await this.model.create(interview);
    return created.toObject();
  }

  async findById(id: string): Promise<Interview | null> {
    const interview = await this.model.findById(id);
    return interview ? interview.toObject() : null;
  }

  async update(id: string, interview: Partial<Interview>): Promise<Interview | null> {
    const updated = await this.model.findByIdAndUpdate(id, interview, { new: true });
    return updated ? updated.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async findByUserId(userId: string): Promise<Interview[]> {
    const interviews = await this.model.find({ userId });
    return interviews.map(i => i.toObject());
  }
}