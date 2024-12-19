import { Express } from 'express';
import { Router } from 'express';
import { container } from '../../config/di';
import { InterviewController } from '../controllers/InterviewController';
import { configureInterviewRoutes } from './interviewRoutes';

export const configureRoutes = (app: Express) => {
  const router = Router();
  
  const interviewController = container.get<InterviewController>('InterviewController');
  configureInterviewRoutes(router, interviewController);

  app.use(router);
};