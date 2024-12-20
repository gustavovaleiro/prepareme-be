import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../logging';
import { LOG_MESSAGES } from '../logging/constants';

export class OpenAIService {
  private static instance: OpenAIService;
  private openai: OpenAI | null = null;

  private constructor() {
    if (env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn('OpenAI API key not provided. AI features will be disabled.');
    }
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async createCompletion(prompt: string): Promise<string> {
    if (!this.openai) {
      logger.warn('Using mock response due to missing OpenAI configuration');
      return this.getMockResponse();
    }

    try {
      logger.info(LOG_MESSAGES.OPENAI.REQUEST_STARTED, {
        model: env.OPENAI_MODEL,
        maxTokens: env.OPENAI_MAX_TOKENS,
        promptLength: prompt.length
      });

      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that always responds with valid JSON. Never include markdown formatting or code blocks in your response.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: env.OPENAI_MAX_TOKENS,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const duration = Date.now() - startTime;
      logger.info(LOG_MESSAGES.OPENAI.REQUEST_COMPLETED, {
        duration,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      logger.error(LOG_MESSAGES.OPENAI.ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt: prompt.substring(0, 100) + '...' // Log only the start of the prompt
      });
      return this.getMockResponse();
    }
  }

  private getMockResponse(): string {
    logger.debug('Returning mock response');
    return JSON.stringify({
      score: 70,
      strengths: ['Good understanding of basic concepts'],
      improvements: ['Could provide more detailed examples']
    });
  }
}