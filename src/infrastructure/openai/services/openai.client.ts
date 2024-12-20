import OpenAI from 'openai';
import { env } from '../../config/env';
import { createLogger } from '../../logging/Logger';
import { ExternalServiceError } from '../../errors/ApplicationError';

const logger = createLogger('OpenAIClient');

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
      logger.info('Sending request to OpenAI', {
        model: env.OPENAI_MODEL,
        maxTokens: env.OPENAI_MAX_TOKENS,
        prompt
      });

      const startTime = Date.now();
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

      const duration = Date.now() - startTime;
      const content = response.choices[0].message.content;

      if (!content) {
        throw new ExternalServiceError('OpenAI', 'Empty response received');
      }

      // Validate JSON
      const parsedResponse = JSON.parse(content);

      logger.info('Received response from OpenAI', {
        duration,
        usage: response.usage,
        response: parsedResponse
      });

      return content;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('OpenAI API error', error, { prompt });
        throw new ExternalServiceError('OpenAI', error.message);
      }
      throw new ExternalServiceError('OpenAI', 'Unknown error occurred');
    }
  }

  private getMockResponse(): string {
    const mockResponse = {
      score: 70,
      strengths: ['Good understanding of basic concepts'],
      improvements: ['Could provide more detailed examples']
    };
    
    logger.debug('Returning mock response', { response: mockResponse });
    return JSON.stringify(mockResponse);
  }
}