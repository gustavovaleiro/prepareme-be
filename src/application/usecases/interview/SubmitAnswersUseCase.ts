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

export class SubmitAnswersUseCase {
  constructor(
    private interviewRepository: InterviewRepository,
    private questionRepository: QuestionRepository,
    private feedbackService: IFeedbackService
  ) {}

  async execute(request: SubmitAnswersRequest): Promise<Interview> {
    const interview = await this.interviewRepository.findById(request.interviewId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    const questions = await Promise.all(
      interview.questions.map(qId => this.questionRepository.findById(qId))
    );

    const expectedAnswers = questions.reduce((acc, q) => {
      if (q && q.expectedAnswer) {
        acc[q.id] = q.expectedAnswer;
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

    return this.interviewRepository.update(interview.id, updatedInterview) as Promise<Interview>;
  }
}