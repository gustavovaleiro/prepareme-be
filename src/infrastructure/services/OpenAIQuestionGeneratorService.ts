import { inject, injectable } from 'inversify';
import { IQuestionGeneratorService } from '../../domain/services/IQuestionGeneratorService';
import { Question, QuestionDifficulty } from '../../domain/entities/Question';
import { QuestionResponseSchema } from '../../domain/schemas/QuestionSchema';
import { OpenAIService } from './OpenAIService';
import { logger } from '../logging';

@injectable()
export class OpenAIQuestionGeneratorService implements IQuestionGeneratorService {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = OpenAIService.getInstance();
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
    const prompt = `Generate exactly 5 core technical themes for ${role} position at ${level} level.
      Themes should be specific and relevant to the role.
      Return as JSON array of strings.
      Response must be in ${language} language.
      Example: ["Data Structures", "Algorithms", "System Design", "Database Management", "Network Security"]`;

    try {
      const response = await this.openAIService.createCompletion(prompt);
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
    const prompt = `Generate 10 technical interview questions for ${role} position at ${level} level about ${theme}.
      Return as JSON array. Each question must have EXACTLY these fields:
      {
        "content": "detailed question text",
        "category": "${theme}",
        "difficulty": "${level}",
        "keywords": ["keyword1", "keyword2", ...]
      }
      
      Requirements:
      - content: detailed question between 10-1000 chars
      - category: must be exactly "${theme}"
      - difficulty: must be exactly "${level}"
      - keywords: 1-10 relevant technical terms
      - Response in ${language} language
      
      Example:
      [{
        "content": "Explain how you would implement a binary search tree and discuss its time complexity for basic operations.",
        "category": "Data Structures",
        "difficulty": "intermediate",
        "keywords": ["BST", "Tree", "Time Complexity", "Search", "Insert"]
      }]`;

    try {
      const response = await this.openAIService.createCompletion(prompt);
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

      // Filter out invalid questions
      return validatedQuestions.filter((q): q is Question => q !== null);
    } catch (error) {
      logger.error('Failed to generate questions for theme:', { theme, error });
      throw new Error(`Failed to generate questions for theme: ${theme}`);
    }
  }
}