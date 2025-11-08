import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Dynamic import for pdf-parse (CommonJS module)
const pdfParse = require('pdf-parse');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseName = formData.get('courseName') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', details: 'Please upload a PDF file' },
        { status: 400 }
      );
    }

    if (!courseName) {
      return NextResponse.json(
        { error: 'No course name provided', details: 'Please provide a course name' },
        { status: 400 }
      );
    }

    // Convert file to buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF to extract text
    let pdfText = '';
    try {
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text;
    } catch (pdfError) {
      return NextResponse.json(
        { error: 'Failed to parse PDF', details: 'Could not extract text from PDF. Make sure the file is a valid PDF.' },
        { status: 400 }
      );
    }

    // Limit text to avoid token limits (use first 15000 characters)
    const truncatedText = pdfText.slice(0, 15000);

    // Call Claude API with extracted text
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Analyze this ${courseName} document and extract 5-8 key topics that would be suitable for MCAT-style practice questions.

Requirements:
1. Focus on core concepts that are testable
2. Each topic should be specific enough for focused study
3. Topics should be challenging and clinically relevant
4. Appropriate for pre-med students studying for MCAT

Respond ONLY with a JSON array in this exact format:
[
  {"id": 1, "name": "Topic Name 1"},
  {"id": 2, "name": "Topic Name 2"}
]

Do not include any markdown formatting or additional text.

Document content:
${truncatedText}`,
        },
      ],
    });

    // Parse the response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean up the response - remove markdown code blocks if present
    const cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let topics;
    try {
      topics = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse topics',
          details: 'Could not parse the AI response. Please try again.'
        },
        { status: 500 }
      );
    }

    // Validate the response format
    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          details: 'The AI did not return a valid list of topics'
        },
        { status: 500 }
      );
    }

    // Ensure each topic has required fields
    topics = topics.map((topic, index) => ({
      id: topic.id || index + 1,
      name: topic.name || `Topic ${index + 1}`,
    }));

    return NextResponse.json({ topics });

  } catch (error: any) {
    console.error('PDF processing error:', error);

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
        error: 'Failed to process PDF',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
