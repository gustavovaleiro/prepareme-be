import { Schema } from 'mongoose';
import { Question, QuestionSchema } from './Question';

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

export const InterviewSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userNumber: { type: String, required: true },
  interviewLanguage: { type: String, required: true },
  role: { type: String, required: true },
  level: { type: String, required: true },
  status: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.PENDING },
  questions: [{ type: Object, required: true }],
  answers: [{
    questionId: { type: Schema.Types.String, ref: 'Question', required: true },
    content: { type: String, required: true },
    submittedAt: { type: Date, required: true }, // Adicione esta linha
  }],
  feedback: {
    overallScore: { type: Number, required: true },
    categoryScores: { type: Object, required: true }, // Altere de Map para Object
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    recommendations: [{ type: String }],
    generatedAt: { type: Date, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});