import { inject, injectable } from 'inversify';
import { Interview, InterviewStatus } from '../../../domain/entities/Interview';
import { InterviewRepository } from '../../../domain/repositories/InterviewRepository';
import { QuestionService } from '../../services/QuestionService';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../infrastructure/logging';
import { LOG_MESSAGES } from '../../../infrastructure/logging/constants';

@injectable()
export class InitiateInterviewUseCase {
  constructor(
    @inject('InterviewRepository')
    private interviewRepository: InterviewRepository,
    @inject('QuestionService')
    private questionService: QuestionService
  ) {}

  async execute(request: any): Promise<Interview> {
    const interviewId = uuidv4(); // Generate UUID for new interview
    
    logger.info(`${LOG_MESSAGES.INTERVIEW.INITIATED}`, {
      interviewId,
      role: request.role,
      level: request.level,
      language: request.interviewLanguage
    });

    const startTime = Date.now();
    const questions = await this.questionService.generateQuestions(
      request.role,
      request.level,
      request.interviewLanguage
    );

    logger.info(`${LOG_MESSAGES.INTERVIEW.QUESTIONS_GENERATED}`, {
      interviewId,
      questionCount: questions.length,
      generationTime: Date.now() - startTime
    });

    const interview: Partial<Interview> = {
      id: interviewId,
      userId: request.userId,
      userEmail: request.userEmail,
      userNumber: request.userNumber,
      interviewLanguage: request.interviewLanguage,
      role: request.role,
      level: request.level,
      status: InterviewStatus.PENDING,
      questions: questions,
      answers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await this.interviewRepository.create(interview);
    
    logger.info('Interview session created', {
      interviewId,
      questionCount: questions.length,
      totalTime: Date.now() - startTime
    });

    return created;
  }
}