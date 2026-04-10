import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai-client';
import { handleOpenAIError } from '@/lib/openai-error-handler';
import { createClient } from '@/lib/supabase/client';
import { ApiResponse, RecommendationRequest, RecommendationResponse } from '@/lib/types/openai';

/**
 * POST /api/openai/recommendations
 * Generates AI-powered product recommendations using GPT-5
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { context, limit = 10 } = body;

    if (!context) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          message: 'Context is required for generating recommendations.',
          isInternal: false,
          statusCode: 400,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get product catalog for context
    const supabase = createClient();
    const { data: products } = await supabase
      .from('products')
      .select('id, name, category, price, description, average_rating')
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(50);

    const typedProducts = (products || []) as Array<{
      id: string;
      name: string;
      category?: string;
      price: number;
    }>;

    const productCatalog = typedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
    }));

    // Prepare GPT-5 prompt
    const systemPrompt = `You are an expert e-commerce product recommendation engine for Ka-ma-ro smartphone store. 
Analyze user behavior, preferences, and product attributes to generate personalized recommendations.
Always provide product IDs from the catalog and explain the reasoning behind each recommendation.`;

    const userPrompt = `${context}

Available Products:
${JSON.stringify(productCatalog, null, 2)}

Generate ${limit} product recommendations in the following JSON format:
{
  "recommendations": [
    {
      "product_id": "uuid",
      "recommendation_type": "personalized|trending|similar|complementary",
      "reason": "Clear explanation why this product is recommended",
      "relevance_score": 0.95
    }
  ]
}`;

    // Call GPT-5 with structured output
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'product_recommendations',
          schema: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    product_id: { type: 'string' },
                    recommendation_type: {
                      type: 'string',
                      enum: ['personalized', 'trending', 'similar', 'complementary'],
                    },
                    reason: { type: 'string' },
                    relevance_score: { type: 'number', minimum: 0, maximum: 1 },
                  },
                  required: ['product_id', 'recommendation_type', 'reason', 'relevance_score'],
                },
              },
            },
            required: ['recommendations'],
          },
        },
      },
      reasoning_effort: 'medium',
      verbosity: 'medium',
      max_completion_tokens: 2000,
    });

    const recommendationData = JSON.parse(
      response.choices[0].message.content || '{"recommendations":[]}'
    );

    const successResponse: ApiResponse<RecommendationResponse> = {
      success: true,
      data: recommendationData,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    const errorResponse = handleOpenAIError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode });
  }
}
