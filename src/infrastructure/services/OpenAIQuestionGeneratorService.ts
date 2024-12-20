import { inject, injectable } from 'inversify';
import { IQuestionGeneratorService } from '../../domain/services/IQuestionGeneratorService';
import { Question } from '../../domain/entities/Question';
import { OpenAIClient } from '../openai/services/openai.client';
import { createLogger } from '../logging/Logger';
import { ExternalServiceError } from '../errors/ApplicationError';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('OpenAIQuestionGenerator');

@injectable()
export class OpenAIQuestionGeneratorService implements IQuestionGeneratorService {
  private openAIClient: OpenAIClient;

  constructor() {
    this.openAIClient = OpenAIClient.getInstance();
  }

  async generateQuestions(role: string, level: string, language: string): Promise<Question[]> {
    try {
      logger.info('Generating questions', { role, level, language });
      
      const themes = await this.generateThemes(role, level, language);
      const questionsPromises = themes.map(theme =>
        this.generateQuestionsForTheme(role, level, theme, language)
      );

      const allQuestions = await Promise.all(questionsPromises);
      return allQuestions.flat();
    } catch (error) {
      logger.error('Failed to generate questions', error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }

  private async generateThemes(role: string, level: string, language: string): Promise<string[]> {
    try {
      const response = await this.openAIClient.createCompletion(
        `Generate exactly 5 core technical themes for ${role} position at ${level} level.
        Themes should be specific and relevant to the role.
        Return JSON in format: { "response": { "temas": ["theme1", "theme2", ...] } }
        Response must be in ${language} language.`
      );

      const parsedResponse = JSON.parse(response);
      const themes = parsedResponse?.response?.temas;
      
      if (!Array.isArray(themes) || themes.length !== 5) {
        throw new ExternalServiceError('OpenAI', 'Invalid number of themes received');
      }

      return themes.map(theme => theme.trim());
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Failed to generate themes', error);
        throw new ExternalServiceError('OpenAI', `Failed to generate themes: ${error.message}`);
      }
      throw new ExternalServiceError('OpenAI', 'Unknown error while generating themes');
    }
  }

  private async generateQuestionsForTheme(
    role: string,
    level: string,
    theme: string,
    language: string
  ): Promise<Question[]> {
    try {
      logger.info('Generating questions for theme', { theme, role, level });

      const response = await this.openAIClient.createCompletion(
        `Generate 10 technical interview questions for ${role} position at ${level} level about ${theme}.
        Return JSON in format: { "response": { "questions": [{ "content": "...", "category": "...", "difficulty": "...", "keywords": [...] }] } }
        
        Requirements:
        - content: detailed question between 10-1000 chars
        - category: must be exactly "${theme}"
        - difficulty: must be exactly "${level}"
        - keywords: 1-10 relevant technical terms
        - Response in ${language} language`
      );

      const parsedResponse = JSON.parse(response);
      const rawQuestions = parsedResponse?.response?.questions;

      if (!Array.isArray(rawQuestions)) {
        throw new ExternalServiceError('OpenAI', 'Invalid questions format received');
      }

      const validatedQuestions = rawQuestions.map(rawQuestion => {
        if (!this.isValidQuestion(rawQuestion)) {
          logger.warn('Invalid question format', { rawQuestion });
          return null;
        }

        return {
          id: uuidv4(), // Generate UUID for each question
          ...rawQuestion,
          roles: [role],
          language,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      const questions = validatedQuestions.filter((q): q is Question => q !== null);
      logger.info('Generated questions for theme', { 
        theme, 
        questionsCount: questions.length 
      });

      return questions;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Failed to generate questions for theme', error, { theme });
        throw new ExternalServiceError('OpenAI', `Failed to generate questions: ${error.message}`);
      }
      throw new ExternalServiceError('OpenAI', 'Unknown error while generating questions');
    }
  }

  private isValidQuestion(question: unknown): boolean {
    if (!question || typeof question !== 'object') {
      return false;
    }

    const q = question as Record<string, unknown>;

    return (
      typeof q.content === 'string' && 
      q.content.length >= 10 && 
      q.content.length <= 1000 &&
      typeof q.category === 'string' &&
      typeof q.difficulty === 'string' &&
      Array.isArray(q.keywords) &&
      q.keywords.every((k: unknown): k is string => typeof k === 'string') &&
      q.keywords.length >= 1 &&
      q.keywords.length <= 10
    );
  }
}