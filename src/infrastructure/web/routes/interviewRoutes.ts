import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { validateInitiateInterview, validateSubmitAnswers } from '../middleware/validation';
import { rateLimit } from 'express-rate-limit';

const interviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

export const configureInterviewRoutes = (
  router: Router,
  controller: InterviewController
) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     InterviewRequest:
   *       type: object
   *       required:
   *         - userId
   *         - userEmail
   *         - userNumber
   *         - interviewLanguage
   *         - role
   *         - level
   *       properties:
   *         userId:
   *           type: string
   *           format: uuid
   *         userEmail:
   *           type: string
   *           format: email
   *         userNumber:
   *           type: string
   *         interviewLanguage:
   *           type: string
   *           enum: [en, pt, es]
   *         role:
   *           type: string
   *           example: "frontend-developer"
   *         level:
   *           type: string
   *           enum: [beginner, intermediate, advanced]
   *     
   *     Interview:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *         status:
   *           type: string
   *           enum: [pending, in_progress, completed]
   *         questions:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Question'
   *     
   *     Question:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *         content:
   *           type: string
   *         category:
   *           type: string
   *         difficulty:
   *           type: string
   *           enum: [beginner, intermediate, advanced]
   *         keywords:
   *           type: array
   *           items:
   *             type: string
   */

  /**
   * @swagger
   * /api/v1/interviews:
   *   post:
   *     summary: Start a new interview session
   *     tags: [Interviews]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InterviewRequest'
   *     responses:
   *       201:
   *         description: Interview session created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Interview'
   *       400:
   *         description: Invalid request parameters
   *       429:
   *         description: Too many requests
   */
  router.post(
    '/api/v1/interviews',
    interviewLimiter,
    validateInitiateInterview,
    controller.initiateInterview.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/interviews/{interviewId}/submit:
   *   post:
   *     summary: Submit answers for an interview
   *     tags: [Interviews]
   *     parameters:
   *       - in: path
   *         name: interviewId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - answers
   *             properties:
   *               answers:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - questionId
   *                     - content
   *                   properties:
   *                     questionId:
   *                       type: string
   *                       format: uuid
   *                     content:
   *                       type: string
   *                       minLength: 1
   *     responses:
   *       200:
   *         description: Answers submitted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 feedback:
   *                   type: object
   *                   properties:
   *                     overallScore:
   *                       type: number
   *                       minimum: 0
   *                       maximum: 100
   *                     categoryScores:
   *                       type: object
   *                       additionalProperties:
   *                         type: number
   *                     strengths:
   *                       type: array
   *                       items:
   *                         type: string
   *                     improvements:
   *                       type: array
   *                       items:
   *                         type: string
   *                     recommendations:
   *                       type: array
   *                       items:
   *                         type: string
   *       400:
   *         description: Invalid submission
   *       404:
   *         description: Interview not found
   *       429:
   *         description: Too many requests
   */
  router.post(
    '/api/v1/interviews/:interviewId/submit',
    interviewLimiter,
    validateSubmitAnswers,
    controller.submitAnswers.bind(controller)
  );
};