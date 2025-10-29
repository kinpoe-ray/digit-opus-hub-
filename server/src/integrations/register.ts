/**
 * Register all AI Providers
 * 在应用启动时调用此函数
 */

import { ProviderFactory } from './factory';
import { AIProviderType } from './types';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';

export function registerProviders(): void {
  // 注册 OpenAI Provider
  ProviderFactory.register(AIProviderType.OPENAI, OpenAIProvider);

  // 注册 Anthropic Provider
  ProviderFactory.register(AIProviderType.ANTHROPIC, AnthropicProvider);

  console.log('✅ AI Providers registered:', ProviderFactory.getRegisteredProviders());
}
