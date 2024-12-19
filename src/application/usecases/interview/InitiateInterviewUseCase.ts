import { Interview, InterviewStatus } from '../../../domain/entities/Interview';
import { InterviewRepository } from '../../../domain/repositories/InterviewRepository';
import { QuestionService } from '../../services/QuestionService';

export interface InitiateInterviewRequest {
  userId: string;
  role: string;
  level: string;
}

export class InitiateInterviewUseCase {
  constructor(
    private interviewRepository: InterviewRepository,
    private questionService: QuestionService
  ) {}

  async execute(request: InitiateInterviewRequest): Promise<Interview> {
    const questions = await this.questionService.generateQuestions(request.role, request.level);
    
    const interview: Partial<Interview> = {
      userId: request.userId,
      role: request.role,
      level: request.level,
      status: InterviewStatus.PENDING,
      questions: questions,
      answers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.interviewRepository.create(interview);
  }
}