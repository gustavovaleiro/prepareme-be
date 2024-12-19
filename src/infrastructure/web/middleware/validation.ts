import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

const initiateInterviewSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().required(),
  level: Joi.string().required()
});

const submitAnswersSchema = Joi.object({
  interviewId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      content: Joi.string().required()
    })
  ).required()
});

export const validateInitiateInterview = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = initiateInterviewSchema.validate(req.body);
  if (error) {
    throw new AppError(400, error.details[0].message);
  }
  next();
};

export const validateSubmitAnswers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = submitAnswersSchema.validate(req.body);
  if (error) {
    throw new AppError(400, error.details[0].message);
  }
  next();
};