import { inject, injectable } from 'inversify';
import { IQuestionGeneratorService } from '../../../domain/services/IQuestionGeneratorService';
import { Question, QuestionDifficulty } from '../../../domain/entities/Question';
import { QuestionResponseSchema } from '../../../domain/schemas/QuestionSchema';
import { OpenAIClient } from './openai.client';
import { createThemesPrompt, createQuestionsPrompt } from '../prompts/questions.prompt';
import { logger } from '../../logging';

@injectable()
export class OpenAIQuestionGeneratorService implements IQuestionGeneratorService {
  private openAIClient: OpenAIClient;

  constructor() {
    this.openAIClient = OpenAIClient.getInstance();
  }

  async generateQuestions(role: string, level: string, language: string): Promise<Question[]> {
    try {
      const themes = await this.generateThemes(role, level, language);
      const questionsPromises = themes.map(theme =>
        this.generateQuestionsForTheme(role, level, theme, language)
      );

      const allQuestions = await Promise.all(questionsPromises);
      return allQuestions.flat();
    } catch (error) {
      logger.error('Failed to generate questions:', error);
      throw new Error('Failed to generate questions');
    }
  }

  private async generateThemes(role: string, level: string, language: string): Promise<string[]> {
    const prompt = createThemesPrompt(role, level, language);

    try {
      const response = await this.openAIClient.createCompletion(prompt);
      const themes = JSON.parse(response);
      
      if (!Array.isArray(themes) || themes.length !== 5) {
        throw new Error('Invalid themes format');
      }

      return themes.map(theme => theme.trim());
    } catch (error) {
      logger.error('Failed to generate themes:', error);
      throw new Error('Failed to generate themes');
    }
  }

  private async generateQuestionsForTheme(
    role: string,
    level: string,
    theme: string,
    language: string
  ): Promise<Question[]> {
    const prompt = createQuestionsPrompt(role, level, theme, language);

    try {
      const response = await this.openAIClient.createCompletion(prompt);
      const rawQuestions = JSON.parse(response);

      if (!Array.isArray(rawQuestions)) {
        throw new Error('Invalid questions format');
      }

      const validatedQuestions = rawQuestions.map(rawQuestion => {
        try {
          const validated = QuestionResponseSchema.parse(rawQuestion);
          return {
            ...validated,
            roles: [role],
            language,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } catch (error) {
          logger.warn('Invalid question format:', { rawQuestion, error });
          return null;
        }
      });

      return validatedQuestions.filter((q): q is Question => q !== null);
    } catch (error) {
      logger.error('Failed to generate questions for theme:', { theme, error });
      throw new Error(`Failed to generate questions for theme: ${theme}`);
    }
  }
}