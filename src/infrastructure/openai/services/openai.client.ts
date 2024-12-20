import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../logging';

export class OpenAIClient {
  private static instance: OpenAIClient;
  private openai: OpenAI | null = null;

  private constructor() {
    if (env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    } else {
      logger.warn('OpenAI API key not provided. AI features will be disabled.');
    }
  }

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async createCompletion(prompt: string): Promise<string> {
    if (!this.openai) {
      logger.warn('OpenAI service not initialized. Using mock response.');
      return this.getMockResponse();
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that always responds with valid JSON. Never include markdown formatting or code blocks in your response.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: env.OPENAI_MAX_TOKENS,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Validate JSON
      JSON.parse(content);
      return content;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      return this.getMockResponse();
    }
  }

  private getMockResponse(): string {
    return JSON.stringify({
      score: 70,
      strengths: ['Good understanding of basic concepts'],
      improvements: ['Could provide more detailed examples']
    });
  }
}