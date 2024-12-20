import { inject, injectable } from 'inversify';
import { Answer } from '../../domain/entities/Interview';
import { IFeedbackService, FeedbackResult } from '../../domain/services/IFeedbackService';
import { OpenAIClient } from '../openai/services/openai.client';
import { createLogger } from '../logging/Logger';
import { ExternalServiceError } from '../errors/ApplicationError';

const logger = createLogger('OpenAIFeedbackService');

@injectable()
export class OpenAIFeedbackService implements IFeedbackService {
  private openAIClient: OpenAIClient;

  constructor() {
    this.openAIClient = OpenAIClient.getInstance();
  }

  async analyzeFeedback(
    answers: Answer[], 
    expectedAnswers: Record<string, string>
  ): Promise<FeedbackResult> {
    try {
      logger.info('Starting feedback analysis', { answersCount: answers.length });

      const analysisPromises = answers.map(answer => 
        this.analyzeAnswer(answer, expectedAnswers[answer.questionId])
      );

      const analyses = await Promise.all(analysisPromises);
      const result = this.aggregateResults(analyses);

      logger.info('Feedback analysis completed', { 
        overallScore: result.overallScore,
        strengthsCount: result.strengths.length,
        improvementsCount: result.improvements.length
      });

      return result;
    } catch (error) {
      logger.error('Feedback analysis failed', error instanceof Error ? error : new Error('Unknown error'));
      throw new ExternalServiceError('OpenAI', 'Failed to analyze feedback');
    }
  }

  private async analyzeAnswer(answer: Answer, expectedAnswer: string): Promise<any> {
    try {
      const prompt = `Compare the following answer with the expected answer:
        Candidate's answer: ${answer.content}
        Expected answer: ${expectedAnswer}
        
        Provide a JSON response with:
        - score (0-100)
        - strengths (array of strings)
        - improvements (array of strings)`;

      const response = await this.openAIClient.createCompletion(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      logger.error('Answer analysis failed', error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }

  private parseAIResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error parsing AI response', error instanceof Error ? error : new Error('Unknown error'));
      throw new ExternalServiceError('OpenAI', 'Failed to parse AI response');
    }
  }

  private aggregateResults(analyses: any[]): FeedbackResult {
    const overallScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const strengths = [...new Set(analyses.flatMap(a => a.strengths))];
    const improvements = [...new Set(analyses.flatMap(a => a.improvements))];

    return {
      overallScore,
      categoryScores: this.calculateCategoryScores(analyses),
      strengths,
      improvements,
      recommendations: this.generateRecommendations(improvements)
    };
  }

  private calculateCategoryScores(analyses: any[]): Record<string, number> {
    return {};
  }

  private generateRecommendations(improvements: string[]): string[] {
    return improvements.map(improvement => 
      `Study more about: ${improvement}`
    );
  }
}