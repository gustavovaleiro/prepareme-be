import mongoose, { Model } from 'mongoose';
import { Interview, InterviewSchema } from '../../../../domain/entities/Interview';
import { Question, QuestionSchema } from '../../../../domain/entities/Question';

// Definindo os tipos corretos para os modelos
export const InterviewModel: Model<Interview> = mongoose.model<Interview>('Interview', InterviewSchema);
export const QuestionModel: Model<Question> = mongoose.model<Question>('Question', QuestionSchema);