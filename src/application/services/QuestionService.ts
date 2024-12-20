import { inject, injectable } from 'inversify';
import { Question } from '../../domain/entities/Question';
import { QuestionRepository } from '../../domain/repositories/QuestionRepository';
import { IQuestionGeneratorService } from '../../domain/services/IQuestionGeneratorService';

@injectable()
export class QuestionService {
  constructor(
    @inject('QuestionRepository')
    private questionRepository: QuestionRepository,
    @inject('QuestionGeneratorService')
    private questionGeneratorService: IQuestionGeneratorService
  ) {}

  async generateQuestions(role: string, level: string, language: string): Promise<Question[]> {
    // Buscar perguntas existentes
    const existingQuestions = await this.questionRepository.findByRoleAndLevel(role, level, language);
    
    if (existingQuestions.length >= 50) {
      // Se já temos perguntas suficientes, selecionar aleatoriamente
      return this.selectRandomQuestionsByThemes(existingQuestions);
    }

    // Gerar novas perguntas se não houver suficientes
    const newQuestions = await this.questionGeneratorService.generateQuestions(role, level, language);
    
    // Salvar as novas perguntas
    await Promise.all(newQuestions.map(q => this.questionRepository.create(q)));

    // Retornar seleção das novas perguntas
    return this.selectRandomQuestionsByThemes(newQuestions);
  }

  private selectRandomQuestionsByThemes(questions: Question[]): Question[] {
    // Agrupar por categoria/tema
    const questionsByTheme = questions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = [];
      }
      acc[q.category].push(q);
      return acc;
    }, {} as Record<string, Question[]>);

    // Selecionar 2 perguntas aleatórias de cada tema
    const selectedQuestions: Question[] = [];
    Object.values(questionsByTheme).forEach(themeQuestions => {
      const shuffled = [...themeQuestions].sort(() => 0.5 - Math.random());
      selectedQuestions.push(...shuffled.slice(0, 2));
    });

    // Garantir que temos exatamente 10 perguntas
    return selectedQuestions.slice(0, 10);
  }
}