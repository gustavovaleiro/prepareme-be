export const createFeedbackPrompt = (answer: string, expectedAnswer: string): string => {
  return `Compare the following answer with the expected answer:
    Candidate's answer: ${answer}
    Expected answer: ${expectedAnswer}
    
    Provide a JSON response with:
    - score (0-100)
    - strengths (array of strings)
    - improvements (array of strings)`;
};