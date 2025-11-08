import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topicName, courseName, previousAnswers, difficulty } = await request.json();

    if (!topicName || !courseName) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'topicName and courseName are required' },
        { status: 400 }
      );
    }

    // Build context from performance
    let context = '';
    let targetDifficulty = difficulty || 'medium';

    if (previousAnswers && previousAnswers.length > 0) {
      const recent = previousAnswers.slice(-3);
      const correctCount = recent.filter((a: any) => a.isCorrect).length;
      const totalCount = recent.length;

      if (correctCount === totalCount) {
        context = 'The student is performing excellently. Increase difficulty with more complex scenarios.';
        targetDifficulty = 'hard';
      } else if (correctCount / totalCount < 0.5) {
        context = 'The student is struggling. Use moderate difficulty with clear teaching moments.';
        targetDifficulty = 'medium';
      } else {
        context = 'The student is doing well. Maintain challenging but fair difficulty.';
        targetDifficulty = 'medium';
      }
    }

    const prompt = `Create an MCAT-style practice question for the topic "${topicName}" in ${courseName}. ${context}

Requirements for an authentic MCAT question:
1. **Tricky wording**: Use phrases like "which of the following is NOT", "EXCEPT", "is FALSE", "is LEAST likely"
2. **Clinical scenarios**: Present a patient case, research study, or laboratory experiment
3. **4-6 options**: Provide options labeled A through D (or up to F)
4. **Plausible distractors**: Wrong answers should be tempting and based on common misconceptions
5. **Deep understanding**: Test application and analysis, not just memorization
6. **Appropriate difficulty**: Target ${targetDifficulty} difficulty level
7. **Passage-based reasoning**: Include enough context that students must integrate information

Example format:
"A researcher is studying enzyme kinetics in a biochemistry lab. She observes that when substrate concentration is doubled, the reaction rate increases by only 20%. Which of the following is NOT a valid explanation for this observation?"

Respond ONLY with JSON in this exact format:
{
  "question": "Full question text with scenario",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctIndex": 0,
  "difficulty": "${targetDifficulty}",
  "concept": "Brief concept being tested (2-4 words)"
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

    let question;
    try {
      question = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse question',
          details: 'Could not parse the AI response. Please try again.'
        },
        { status: 500 }
      );
    }

    // Validate the response format
    if (!question.question || !Array.isArray(question.options) || question.correctIndex === undefined) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          details: 'The AI did not return a valid question'
        },
        { status: 500 }
      );
    }

    // Ensure all required fields are present
    question = {
      question: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      difficulty: question.difficulty || targetDifficulty,
      concept: question.concept || topicName,
    };

    return NextResponse.json(question);

  } catch (error: any) {
    console.error('Question generation error:', error);

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
        error: 'Failed to generate question',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
