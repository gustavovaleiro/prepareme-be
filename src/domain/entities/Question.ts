import { randomUUID } from 'crypto';
import { Schema } from 'mongoose';

export interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: QuestionDifficulty;
  roles: string[];
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum QuestionDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export const QuestionSchema = new Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: Object.values(QuestionDifficulty), required: true },
  roles: [{ type: String }],
  keywords: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});