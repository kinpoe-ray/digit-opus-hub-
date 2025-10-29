/**
 * Anthropic Configuration
 */

import { AIProviderConfig } from '../types';

export function createAnthropicConfig(apiKey?: string): AIProviderConfig {
  return {
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL,
    timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || '60000'),
    maxRetries: parseInt(process.env.ANTHROPIC_MAX_RETRIES || '3'),
  };
}
