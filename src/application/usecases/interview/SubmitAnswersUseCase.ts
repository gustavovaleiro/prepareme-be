import { inject, injectable } from 'inversify';
import { Interview, InterviewStatus } from '../../../domain/entities/Interview';
import { InterviewRepository } from '../../../domain/repositories/InterviewRepository';
import { QuestionRepository } from '../../../domain/repositories/QuestionRepository';
import { IFeedbackService } from '../../../domain/services/IFeedbackService';

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
    private interviewRepository: InterviewRepository,
    @inject('QuestionRepository')
    private questionRepository: QuestionRepository,
    @inject('FeedbackService')
    private feedbackService: IFeedbackService
  ) {}

  async execute(request: SubmitAnswersRequest): Promise<Interview> {
    const interview = await this.interviewRepository.findById(request.interviewId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    const questions = await Promise.all(
      interview.questions.map(q => this.questionRepository.findById(q.id))
    );

    const expectedAnswers = questions.reduce((acc, q) => {
      if (q) {
        acc[q.id] = q.content; // Usando o content como resposta esperada
      }
      return acc;
    }, {} as Record<string, string>);

    const formattedAnswers = request.answers.map(answer => ({
      questionId: answer.questionId,
      content: answer.content,
      submittedAt: new Date()
    }));

    const feedback = await this.feedbackService.analyzeFeedback(
      formattedAnswers,
      expectedAnswers
    );

    const updatedInterview: Partial<Interview> = {
      status: InterviewStatus.COMPLETED,
      answers: formattedAnswers,
      feedback: {
        ...feedback,
        generatedAt: new Date()
      },
      updatedAt: new Date()
    };

    const result = await this.interviewRepository.update(interview.id, updatedInterview);
    if (!result) {
      throw new Error('Failed to update interview');
    }

    return result;
  }
}