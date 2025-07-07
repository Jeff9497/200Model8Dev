import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json();

    if (!message || !model) {
      return NextResponse.json(
        { error: 'Message and model are required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

    // Create a system prompt optimized for coding assistance
    const systemPrompt = `You are an expert coding assistant specialized in debugging, code analysis, and programming help. 

Key guidelines:
- Focus on practical, actionable solutions
- Explain your reasoning clearly
- Provide code examples when helpful
- Identify potential bugs, performance issues, and improvements
- Suggest best practices and modern approaches
- Format code blocks with proper syntax highlighting
- Be concise but thorough in explanations

When analyzing code:
1. First identify what the code is trying to do
2. Point out any issues or bugs
3. Suggest improvements or fixes
4. Explain why your suggestions are better
5. Provide the corrected/improved code if applicable`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: model,
      temperature: 0.1, // Lower temperature for more consistent coding responses
      max_tokens: 4000,
      top_p: 0.9,
      stream: false
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('Groq API error:', error);

    // Handle specific Groq API errors
    if (error?.status === 429) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later or switch to a Claude model for unlimited usage.',
          rateLimited: true
        },
        { status: 429 }
      );
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Groq API configuration.' },
        { status: 401 }
      );
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request. Please check your input and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
