import { Container } from 'inversify';
import 'reflect-metadata';
import { InterviewRepository } from '../../domain/repositories/InterviewRepository';
import { QuestionRepository } from '../../domain/repositories/QuestionRepository';
import { IFeedbackService } from '../../domain/services/IFeedbackService';
import { MongoInterviewRepository } from '../database/mongodb/repositories/MongoInterviewRepository';
import { MongoQuestionRepository } from '../database/mongodb/repositories/MongoQuestionRepository';
import { OpenAIFeedbackService } from '../services/OpenAIFeedbackService';
import { QuestionService } from '../../application/services/QuestionService';
import { InitiateInterviewUseCase } from '../../application/usecases/interview/InitiateInterviewUseCase';
import { SubmitAnswersUseCase } from '../../application/usecases/interview/SubmitAnswersUseCase';
import { InterviewController } from '../web/controllers/InterviewController';
import { InterviewModel, QuestionModel } from '../database/mongodb/models';

const container = new Container({ defaultScope: 'Singleton' });

// Bind all dependencies
container.bind<InterviewRepository>('InterviewRepository')
  .toDynamicValue(() => new MongoInterviewRepository(InterviewModel))
  .inSingletonScope();

container.bind<QuestionRepository>('QuestionRepository')
  .toDynamicValue(() => new MongoQuestionRepository(QuestionModel))
  .inSingletonScope();

container.bind<IFeedbackService>('FeedbackService')
  .to(OpenAIFeedbackService)
  .inSingletonScope();

container.bind<QuestionService>('QuestionService')
  .to(QuestionService)
  .inSingletonScope();

container.bind<InitiateInterviewUseCase>('InitiateInterviewUseCase')
  .to(InitiateInterviewUseCase)
  .inSingletonScope();

container.bind<SubmitAnswersUseCase>('SubmitAnswersUseCase')
  .to(SubmitAnswersUseCase)
  .inSingletonScope();

container.bind<InterviewController>('InterviewController')
  .to(InterviewController)
  .inSingletonScope();

export { container };