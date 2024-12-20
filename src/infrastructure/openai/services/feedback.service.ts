import { inject, injectable } from 'inversify';
import { Answer } from '../../../domain/entities/Interview';
import { IFeedbackService, FeedbackResult } from '../../../domain/services/IFeedbackService';
import { OpenAIClient } from './openai.client';
import { createFeedbackPrompt } from '../prompts/feedback.prompt';
import { logger } from '../../logging';

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
      const analysisPromises = answers.map(answer =>
        this.analyzeAnswer(answer, expectedAnswers[answer.questionId])
      );

      const analyses = await Promise.all(analysisPromises);
      return this.aggregateResults(analyses);
    } catch (error) {
      logger.error('Feedback analysis error:', error);
      throw new Error('Failed to analyze feedback');
    }
  }

  private async analyzeAnswer(answer: Answer, expectedAnswer: string): Promise<any> {
    const prompt = createFeedbackPrompt(answer.content, expectedAnswer);
    const response = await this.openAIClient.createCompletion(prompt);
    return this.parseAIResponse(response);
  }

  private parseAIResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error parsing AI response:', error);
      return {
        score: 0,
        strengths: [],
        improvements: ['Failed to analyze response']
      };
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