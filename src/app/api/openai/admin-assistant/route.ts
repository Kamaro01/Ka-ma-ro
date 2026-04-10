import { getOpenAIClient } from '@/lib/openai-client';
import { handleOpenAIError } from '@/lib/openai-error-handler';
import { ChatCompletionRequest } from '@/lib/types/openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * POST /api/openai/admin-assistant
 * AI assistant for real-time admin support - streams responses.
 */
export async function POST(request: Request) {
  try {
    const body: ChatCompletionRequest = await request.json();
    const { messages, max_completion_tokens = 2000 } = body;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Messages array is required and cannot be empty.',
            isInternal: false,
            statusCode: 400,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced system message for admin assistant
    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are an intelligent AI assistant for Ka-ma-ro e-commerce platform administrators, similar to JARVIS from Iron Man. Your purpose is to help administrators with:

- Product management and inventory queries
- Order processing and customer support guidance
- Analytics interpretation and business insights
- Technical troubleshooting and problem-solving
- Marketing strategy recommendations
- System configuration assistance

Be concise, professional, and proactive. Offer actionable suggestions and highlight potential issues. Format responses clearly with bullet points when listing items. Always prioritize helping the admin work efficiently and make informed decisions.`,
    };

    const enhancedMessages = [systemMessage, ...(messages as ChatCompletionMessageParam[])];

    const stream = await getOpenAIClient().chat.completions.create({
      model: 'gpt-5-mini',
      messages: enhancedMessages,
      stream: true,
      reasoning_effort: 'low',
      verbosity: 'medium',
      max_completion_tokens,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const errorResponse = handleOpenAIError(error);
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
