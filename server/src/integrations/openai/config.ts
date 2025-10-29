/**
 * OpenAI Configuration
 */

import { AIProviderConfig } from '../types';

export function createOpenAIConfig(apiKey?: string): AIProviderConfig {
  return {
    apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL,
    organization: process.env.OPENAI_ORGANIZATION,
    timeout: parseInt(process.env.OPENAI_TIMEOUT || '60000'),
    maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3'),
  };
}
