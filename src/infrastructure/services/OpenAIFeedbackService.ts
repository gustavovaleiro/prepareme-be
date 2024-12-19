import OpenAI from 'openai';

import { Answer } from '../../domain/entities/Interview';
import { IFeedbackService, FeedbackResult } from '../../domain/services/IFeedbackService';

export class OpenAIFeedbackService implements IFeedbackService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
  }

  async analyzeFeedback(answers: Answer[], expectedAnswers: Record<string, string>): Promise<FeedbackResult> {
    const analysisPromises = answers.map(async (answer) => {
      const expectedAnswer = expectedAnswers[answer.questionId];
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer analyzing candidate responses."
          },
          {
            role: "user",
            content: `Compare the following answer with the expected answer:
              Candidate's answer: ${answer.content}
              Expected answer: ${expectedAnswer}
              
              Provide a score from 0-100 and identify strengths and areas for improvement.`
          }
        ]
      });

      return this.parseAIResponse(response.choices[0].message.content || "");
    });

    const analyses = await Promise.all(analysisPromises);
    
    return this.aggregateResults(analyses);
  }

  private parseAIResponse(response: string): any {
    // Implementation of parsing AI response
    // This would extract score, strengths, and improvements from the AI response
    return {
      score: 0,
      strengths: [],
      improvements: []
    };
  }

  private aggregateResults(analyses: any[]): FeedbackResult {
    const overallScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0) / analyses.length;
    const strengths = analyses.flatMap(analysis => analysis.strengths);
    const improvements = analyses.flatMap(analysis => analysis.improvements);

    return {
      overallScore,
      categoryScores: {},
      strengths: [...new Set(strengths)],
      improvements: [...new Set(improvements)],
      recommendations: this.generateRecommendations(improvements)
    };
  }

  private generateRecommendations(improvements: string[]): string[] {
    // Implementation of generating recommendations based on improvements
    return improvements.map(improvement => `Study more about: ${improvement}`);
  }
}