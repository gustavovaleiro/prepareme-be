import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { validateInitiateInterview, validateSubmitAnswers } from '../middleware/validation';
import { rateLimit } from 'express-rate-limit';

const interviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export const configureInterviewRoutes = (
  router: Router,
  controller: InterviewController
) => {
  /**
   * @swagger
   * /api/interview/questions:
   *   post:
   *     summary: Initiate a new interview and get questions
   *     tags: [Interview]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - role
   *               - level
   *             properties:
   *               userId:
   *                 type: string
   *               role:
   *                 type: string
   *               level:
   *                 type: string
   */
  router.post(
    '/api/interview/questions',
    interviewLimiter,
    validateInitiateInterview,
    controller.initiateInterview.bind(controller)
  );

  /**
   * @swagger
   * /api/interview/submit:
   *   post:
   *     summary: Submit interview answers and get feedback
   *     tags: [Interview]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - interviewId
   *               - answers
   *             properties:
   *               interviewId:
   *                 type: string
   *               answers:
   *                 type: array
   *                 items:
   *                   type: object
   */
  router.post(
    '/api/interview/submit',
    interviewLimiter,
    validateSubmitAnswers,
    controller.submitAnswers.bind(controller)
  );

  return router;
};