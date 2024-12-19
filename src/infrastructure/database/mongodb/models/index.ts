import mongoose from 'mongoose';
import { InterviewSchema } from '../../../../domain/entities/Interview';
import { QuestionSchema } from '../../../../domain/entities/Question';

export const InterviewModel = mongoose.model('Interview', InterviewSchema);
export const QuestionModel = mongoose.model('Question', QuestionSchema);