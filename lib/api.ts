import type {
  Question,
  Explanation,
  QuestionAttempt,
} from '@/types';

/**
 * Process a PDF file and extract topics using Claude API
 * @param file - The PDF file to process
 * @param courseName - Name of the course
 * @returns Promise with array of topics
 */
export async function processPDF(
  file: File,
  courseName: string
): Promise<{ id: number; name: string }[]> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseName', courseName);

    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to process PDF');
    }

    const data = await response.json();
    return data.topics;
  } catch (error) {
    console.error('API Error - processPDF:', error);
    throw error;
  }
}

/**
 * Generate a new MCAT-style practice question
 * @param topicName - The topic to generate a question for
 * @param courseName - The course name
 * @param previousAnswers - Optional array of previous answer attempts for adaptive difficulty
 * @param difficulty - Optional difficulty level override
 * @returns Promise with generated question
 */
export async function generateQuestion(
  topicName: string,
  courseName: string,
  previousAnswers: QuestionAttempt[] = [],
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question> {
  try {
    const response = await fetch('/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicName,
        courseName,
        previousAnswers,
        difficulty,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to generate question');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error - generateQuestion:', error);
    throw error;
  }
}

/**
 * Generate a detailed explanation for a question answer
 * @param question - The question that was answered
 * @param userAnswerIndex - Index of the user's selected answer
 * @param correctIndex - Index of the correct answer
 * @param topicName - The topic name
 * @param courseName - The course name
 * @returns Promise with explanation
 */
export async function generateExplanation(
  question: Question,
  userAnswerIndex: number,
  correctIndex: number,
  topicName: string,
  courseName: string
): Promise<Explanation> {
  try {
    const response = await fetch('/api/generate-explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        userAnswerIndex,
        correctIndex,
        topicName,
        courseName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to generate explanation');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error - generateExplanation:', error);
    throw error;
  }
}
