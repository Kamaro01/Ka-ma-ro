import OpenAI from 'openai';

/**
 * Initializes the OpenAI client with the API key from environment variables.
 * This should only be used on the server-side (API routes, Server Components).
 * @returns {OpenAI} Configured OpenAI client instance.
 */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
