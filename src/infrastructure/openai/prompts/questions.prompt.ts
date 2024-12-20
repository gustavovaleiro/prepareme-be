export const createThemesPrompt = (role: string, level: string, language: string): string => {
  return `Generate exactly 5 core technical themes for ${role} position at ${level} level.
    Themes should be specific and relevant to the role.
    Return as JSON array of strings.
    Response must be in ${language} language.
    Example: ["Data Structures", "Algorithms", "System Design", "Database Management", "Network Security"]`;
};

export const createQuestionsPrompt = (
  role: string,
  level: string,
  theme: string,
  language: string
): string => {
  return `Generate 10 technical interview questions for ${role} position at ${level} level about ${theme}.
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
    - Response in ${language} language`;
};