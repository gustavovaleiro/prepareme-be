import { inject, injectable } from 'inversify';
import { Interview, InterviewStatus } from '../../../domain/entities/Interview';
import { InterviewRepository } from '../../../domain/repositories/InterviewRepository';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/ApplicationError';
import { createLogger } from '../../../infrastructure/logging/Logger';

const logger = createLogger('SubmitAnswersUseCase');

export interface SubmitAnswersRequest {
  interviewId: string;
  answers: Array<{
    questionId: string;
    content: string;
  }>;
}

@injectable()
export class SubmitAnswersUseCase {
  constructor(
    @inject('InterviewRepository')
    private interviewRepository: InterviewRepository
  ) {}

  async execute(request: SubmitAnswersRequest): Promise<Interview> {
    logger.info('Processing answer submission', { interviewId: request.interviewId });

    // Buscar a entrevista
    const interview = await this.interviewRepository.findById(request.interviewId);
    if (!interview) {
      throw new NotFoundError('Interview', request.interviewId);
    }

    // Validar se todas as questões pertencem à entrevista
    const questionIds = interview.questions.map(q => q.id);
    const invalidQuestions = request.answers.filter(a => !questionIds.includes(a.questionId));
    
    if (invalidQuestions.length > 0) {
      throw new ValidationError(
        'Invalid question IDs provided',
        { invalidQuestionIds: invalidQuestions.map(q => q.questionId) }
      );
    }

    // Formatar as respostas com timestamp
    const formattedAnswers = request.answers.map(answer => ({
      questionId: answer.questionId,
      content: answer.content,
      submittedAt: new Date()
    }));

    // Atualizar a entrevista
    const updatedInterview = await this.interviewRepository.update(interview.id, {
      status: InterviewStatus.COMPLETED,
      answers: formattedAnswers,
      updatedAt: new Date()
    });

    if (!updatedInterview) {
      throw new Error('Failed to update interview');
    }

    logger.info('Answer submission completed', { 
      interviewId: request.interviewId,
      answersCount: formattedAnswers.length
    });

    return updatedInterview;
  }
}