# Guia de Estudo - Sistema de Preparação para Entrevistas

## 1. Arquitetura e Padrões de Projeto

### Clean Architecture
- Camadas da arquitetura:
  - Domain (Entidades e Regras de Negócio)
  - Application (Casos de Uso)
  - Infrastructure (Implementações Técnicas)
  - Interface (Controllers e Routes)
- Benefícios:
  - Independência de frameworks
  - Testabilidade
  - Manutenibilidade

### SOLID Principles
- Single Responsibility Principle (SRP)
  - Exemplo: Separação de repositories por entidade
- Open/Closed Principle (OCP)
  - Exemplo: Interface IFeedbackService
- Liskov Substitution Principle (LSP)
  - Exemplo: MongoInterviewRepository implementando InterviewRepository
- Interface Segregation Principle (ISP)
  - Exemplo: Separação de interfaces de repositório
- Dependency Inversion Principle (DIP)
  - Exemplo: Injeção de dependências com Inversify

### Domain-Driven Design (DDD)
- Entidades: Interview, Question
- Value Objects
- Agregados
- Repositories
- Services

## 2. Tecnologias Principais

### Node.js & TypeScript
- Tipagem estática
- Interfaces e Types
- Decorators
- Generics
- Async/Await
- Error Handling

### Express.js
- Middleware
- Routing
- Error Handling
- Request/Response handling
- Validação com Joi

### MongoDB com Mongoose
- Schemas
- Models
- Queries
- Relacionamentos
- Índices

### OpenAI Integration
- API Configuration
- Prompt Engineering
- Response Processing
- Error Handling

## 3. Padrões de Implementação

### Repository Pattern
- Abstração do acesso a dados
- Implementações específicas
- Query methods
- CRUD operations

### Dependency Injection
- Container configuration
- Service registration
- Lifetime management
- Scoping

### Error Handling
- Error types
- Global error handler
- HTTP status codes
- Error logging

### Logging
- Winston configuration
- Log levels
- Transport types
- Format customization

## 4. Testing

### Jest & Testing Patterns
- Unit Tests
- Integration Tests
- Mocking
- Test Coverage
- Test Driven Development (TDD)

### Test Types
- Repository Tests
- Service Tests
- Use Case Tests
- Controller Tests
- End-to-End Tests

## 5. API Documentation

### Swagger/OpenAPI
- Route documentation
- Schema definition
- Authentication
- Response examples

## 6. Security

### Best Practices
- Input validation
- Rate limiting
- CORS
- Helmet
- Environment variables

## 7. Performance

### Optimization Techniques
- Caching strategies
- Database indexing
- Query optimization
- Response compression

## 8. DevOps

### Development Workflow
- Environment setup
- Dependency management
- Build process
- Deployment strategies

## Recursos de Estudo

### Livros Recomendados
- Clean Architecture (Robert C. Martin)
- Domain-Driven Design (Eric Evans)
- Node.js Design Patterns (Mario Casciaro)

### Cursos Online
- TypeScript Master Class
- MongoDB University
- Clean Architecture Fundamentals
- Testing JavaScript Applications

### Documentação Oficial
- Node.js: https://nodejs.org/docs
- TypeScript: https://www.typescriptlang.org/docs
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/docs/
- OpenAI: https://platform.openai.com/docs

### Práticas Recomendadas
1. Implemente um projeto similar do zero
2. Escreva testes para cada componente
3. Documente suas decisões arquiteturais
4. Pratique code reviews
5. Contribua para projetos open source similares