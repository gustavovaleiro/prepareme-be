import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { validateInitiateInterview, validateSubmitAnswers } from '../middleware/validation';
import { rateLimit } from 'express-rate-limit';
import { timeout } from '../middleware/timeout';

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
    timeout(5000),
    controller.initiateInterview.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/interviews/{interviewId}/answers:
   *   post:
   *     summary: Submit answers for an interview
   *     tags: [Interviews]
   *     parameters:
   *       - in: path
   *         name: interviewId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: UUID of the interview
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
   *                       description: UUID of the question being answered
   *                     content:
   *                       type: string
   *                       minLength: 1
   *                       maxLength: 10000
   *                       description: The answer content
   *     responses:
   *       200:
   *         description: Answers submitted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                 status:
   *                   type: string
   *                   enum: [completed]
   *                 answers:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       questionId:
   *                         type: string
   *                         format: uuid
   *                       content:
   *                         type: string
   *                       submittedAt:
   *                         type: string
   *                         format: date-time
   *       400:
   *         description: Invalid submission format or data
   *       404:
   *         description: Interview not found
   *       422:
   *         description: Invalid question IDs
   *       429:
   *         description: Too many requests
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/api/v1/interviews/:interviewId/answers',
    interviewLimiter,
    validateSubmitAnswers,
    timeout(5000),
    controller.submitAnswers.bind(controller)
  );
};