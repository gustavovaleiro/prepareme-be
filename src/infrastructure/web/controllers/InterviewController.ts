import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { InitiateInterviewUseCase } from '../../../application/usecases/interview/InitiateInterviewUseCase';
import { SubmitAnswersUseCase } from '../../../application/usecases/interview/SubmitAnswersUseCase';
import { AppError } from '../middleware/errorHandler';

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
        throw new AppError(400, 'Interview language is required');
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
      throw new AppError(400, error instanceof Error ? error.message : 'Failed to initiate interview');
    }
  }

  async submitAnswers(req: Request, res: Response): Promise<void> {
    try {
      const { interviewId, answers } = req.body;
      const result = await this.submitAnswersUseCase.execute({
        interviewId,
        answers
      });
      res.status(200).json(result);
    } catch (error) {
      throw new AppError(400, error instanceof Error ? error.message : 'Failed to submit answers');
    }
  }
}