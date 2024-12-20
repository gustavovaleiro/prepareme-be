import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../../errors/ApplicationError';

const initiateInterviewSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  userEmail: Joi.string().email().required(),
  userNumber: Joi.string().required(),
  interviewLanguage: Joi.string().required(),
  role: Joi.string().required(),
  level: Joi.string().required()
});

const submitAnswersSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().uuid().required(),
      content: Joi.string().min(1).max(10000).required()
    })
  ).min(1).required()
});

export const validateInitiateInterview = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = initiateInterviewSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
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
    throw new ValidationError(error.details[0].message);
  }
  next();
};