// API Response Types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    isInternal: boolean;
    statusCode: number;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Chat Completion Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
  verbosity?: 'low' | 'medium' | 'high';
  max_completion_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  message: string;
}

// Recommendation Types
export interface RecommendationRequest {
  context: string;
  limit: number;
}

export interface RecommendationItem {
  product_id: string;
  recommendation_type: string;
  reason: string;
  relevance_score: number;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
}
