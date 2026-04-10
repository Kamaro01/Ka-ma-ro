import {
  APIConnectionError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
  InternalServerError,
} from 'openai';
import { ApiErrorResponse } from './types/openai';

/**
 * Maps OpenAI API error types to structured error responses.
 * @param {Error} error - The error object from OpenAI API.
 * @returns {ApiErrorResponse} Structured error response.
 */
export function handleOpenAIError(error: any): ApiErrorResponse {
  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: {
        message: 'Invalid API key or authentication failed. Please check your OpenAI API key.',
        isInternal: true,
        statusCode: 401,
      },
    };
  } else if (error instanceof PermissionDeniedError) {
    return {
      success: false,
      error: {
        message:
          'Quota exceeded or authorization failed. You may have exceeded your usage limits or do not have access to this resource.',
        isInternal: true,
        statusCode: 403,
      },
    };
  } else if (error instanceof RateLimitError) {
    return {
      success: false,
      error: {
        message:
          'Rate limit exceeded. You are sending requests too quickly. Please wait a moment and try again.',
        isInternal: true,
        statusCode: 429,
      },
    };
  } else if (error instanceof InternalServerError) {
    return {
      success: false,
      error: {
        message: 'OpenAI service is currently unavailable. Please try again later.',
        isInternal: true,
        statusCode: error.status || 500,
      },
    };
  } else if (error instanceof APIConnectionError) {
    return {
      success: false,
      error: {
        message:
          'Unable to connect to OpenAI service. Please check your API key and internet connection.',
        isInternal: true,
        statusCode: 503,
      },
    };
  } else {
    return {
      success: false,
      error: {
        message: error?.message || 'An unexpected error occurred. Please try again.',
        isInternal: false,
        statusCode: error?.status || 500,
      },
    };
  }
}
