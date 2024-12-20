import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { InitiateInterviewUseCase } from '../../../application/usecases/interview/InitiateInterviewUseCase';
import { SubmitAnswersUseCase } from '../../../application/usecases/interview/SubmitAnswersUseCase';
import { ValidationError } from '../../errors/ApplicationError';
import { createLogger } from '../../logging/Logger';

const logger = createLogger('InterviewController');

@injectable()
export class InterviewController {
  constructor(
    @inject('InitiateInterviewUseCase')
    private initiateInterviewUseCase: InitiateInterviewUseCase,
    @inject('SubmitAnswersUseCase')
    private submitAnswersUseCase: SubmitAnswersUseCase
  ) {}

  async initiateInterview(req: Request, res: Response): Promise<void> {
    try {
      const { userId, userEmail, userNumber, interviewLanguage, role, level } = req.body;
      
      if (!interviewLanguage) {
        throw new ValidationError('Interview language is required');
      }

      const interview = await this.initiateInterviewUseCase.execute({
        userId,
        userEmail,
        userNumber,
        interviewLanguage,
        role,
        level
      });
      
      res.status(201).json(interview);
    } catch (error) {
      // Propaga o erro para o error handler global
      throw error;
    }
  }

  async submitAnswers(req: Request, res: Response): Promise<void> {
    try {
      const { interviewId } = req.params;
      const { answers } = req.body;

      logger.info('Processing answer submission', { interviewId });

      const result = await this.submitAnswersUseCase.execute({
        interviewId,
        answers
      });

      // Se chegou aqui, a operação foi bem sucedida
      res.status(200).json(result);
    } catch (error) {
      // Propaga o erro para o error handler global
      throw error;
    }
  }
}