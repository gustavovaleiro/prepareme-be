import { Schema } from 'mongoose';

export interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: QuestionDifficulty;
  roles: string[];
  keywords: string[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum QuestionDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export const QuestionSchema = new Schema<Question>({
  id: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: Object.values(QuestionDifficulty), 
    required: true 
  },
  roles: [{ type: String }],
  keywords: [{ type: String }],
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Criar índice no campo id
QuestionSchema.index({ id: 1 }, { unique: true });