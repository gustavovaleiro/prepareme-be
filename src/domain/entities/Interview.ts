import { Schema } from 'mongoose';
import { Question } from './Question';

export interface Interview {
  id: string;
  userId: string;
  userEmail: string;
  userNumber: string;
  interviewLanguage: string;
  role: string;
  level: string;
  status: InterviewStatus;
  questions: Question[];
  answers: Answer[];
  feedback?: Feedback;
  createdAt: Date;
  updatedAt: Date;
}

export enum InterviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Answer {
  questionId: string;
  content: string;
  submittedAt: Date;
}

export interface Feedback {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  generatedAt: Date;
}

export const InterviewSchema = new Schema<Interview>({
  id: { type: String, required: true, unique: true }, // Adicionado unique: true
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userNumber: { type: String, required: true },
  interviewLanguage: { type: String, required: true },
  role: { type: String, required: true },
  level: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(InterviewStatus), 
    default: InterviewStatus.PENDING 
  },
  questions: [{
    id: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    roles: [{ type: String }],
    keywords: [{ type: String }],
    language: { type: String, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  }],
  answers: [{
    questionId: { type: String, required: true },
    content: { type: String, required: true },
    submittedAt: { type: Date, required: true }
  }],
  feedback: {
    type: {
      overallScore: { type: Number },
      categoryScores: { type: Schema.Types.Mixed },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      recommendations: [{ type: String }],
      generatedAt: { type: Date }
    },
    required: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Criar índices
InterviewSchema.index({ id: 1 }, { unique: true });
InterviewSchema.index({ userId: 1 });