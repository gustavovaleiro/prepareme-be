import { Request, Response } from 'express';
import { InitiateInterviewUseCase } from '../../../application/usecases/interview/InitiateInterviewUseCase';
import { SubmitAnswersUseCase } from '../../../application/usecases/interview/SubmitAnswersUseCase';

export class InterviewController {
  constructor(
    private initiateInterviewUseCase: InitiateInterviewUseCase,
    private submitAnswersUseCase: SubmitAnswersUseCase
  ) {}

  async initiateInterview(req: Request, res: Response): Promise<void> {
    const { userId, role, level } = req.body;
    const interview = await this.initiateInterviewUseCase.execute({
      userId,
      role,
      level
    });
    res.status(201).json(interview);
  }

  async submitAnswers(req: Request, res: Response): Promise<void> {
    const { interviewId, answers } = req.body;
    const feedback = await this.submitAnswersUseCase.execute({
      interviewId,
      answers
    });
    res.status(200).json(feedback);
  }
}