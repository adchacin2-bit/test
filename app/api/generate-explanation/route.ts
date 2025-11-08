import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswerIndex, correctIndex, topicName, courseName } = await request.json();

    if (!question || userAnswerIndex === undefined || correctIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'question, userAnswerIndex, and correctIndex are required' },
        { status: 400 }
      );
    }

    const isCorrect = userAnswerIndex === correctIndex;
    const userAnswer = question.options[userAnswerIndex];
    const correctAnswer = question.options[correctIndex];

    const prompt = `A pre-med student studying ${courseName} (topic: ${topicName}) just answered this MCAT-style question:

Question: ${question.question}

Options:
${question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

Student's answer: ${String.fromCharCode(65 + userAnswerIndex)}. ${userAnswer}
Correct answer: ${String.fromCharCode(65 + correctIndex)}. ${correctAnswer}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Provide a detailed explanation that:
1. ${isCorrect ? 'Reinforces why their answer is correct' : 'Explains why their answer was incorrect'}
2. Explains why the correct answer is right (with underlying mechanisms/principles)
3. Provides a key insight that crystallizes the core concept
4. Suggests what to focus on next for mastery

Tone: Encouraging professor who respects the student's intelligence. Not patronizing.

Respond ONLY with JSON in this exact format:
{
  "isCorrect": ${isCorrect},
  "correctAnswer": "${String.fromCharCode(65 + correctIndex)}. ${correctAnswer}",
  "yourAnswer": "${String.fromCharCode(65 + userAnswerIndex)}. ${userAnswer}",
  "keyInsight": "The fundamental concept the student should remember (2-3 sentences)",
  "nextSteps": "What to study or practice next to master this concept (2-3 sentences)"
}

Do not include any markdown formatting or additional text.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean up the response
    const cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let explanation;
    try {
      explanation = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse explanation',
          details: 'Could not parse the AI response. Please try again.'
        },
        { status: 500 }
      );
    }

    // Validate the response format
    if (!explanation.keyInsight || !explanation.nextSteps) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          details: 'The AI did not return a valid explanation'
        },
        { status: 500 }
      );
    }

    // Ensure all required fields are present
    explanation = {
      isCorrect: explanation.isCorrect !== undefined ? explanation.isCorrect : isCorrect,
      correctAnswer: explanation.correctAnswer || correctAnswer,
      yourAnswer: explanation.yourAnswer || userAnswer,
      keyInsight: explanation.keyInsight,
      nextSteps: explanation.nextSteps,
    };

    return NextResponse.json(explanation);

  } catch (error: any) {
    console.error('Explanation generation error:', error);

    if (error.status === 401) {
      return NextResponse.json(
        {
          error: 'API authentication failed',
          details: 'Please check that ANTHROPIC_API_KEY is set correctly in environment variables'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate explanation',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
