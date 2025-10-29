/**
 * Anthropic Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AIProviderType,
  AIModel,
  AIRequest,
  AIResponse,
  AIUsageMetrics,
  AIProviderConfig,
  AIError,
  AIErrorCode,
} from '../types';

// Anthropic 定价（美元/1M tokens）- 2024年1月价格
const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-opus-20240229': { input: 15, output: 75 },
  'claude-3-sonnet-20240229': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
};

export class AnthropicProvider extends AIProvider {
  public readonly type = AIProviderType.ANTHROPIC;
  public readonly supportedModels = [
    AIModel.CLAUDE_3_OPUS,
    AIModel.CLAUDE_3_SONNET,
    AIModel.CLAUDE_3_HAIKU,
  ];

  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000,
      maxRetries: 0, // 我们自己处理重试
    });
  }

  /**
   * 执行 Anthropic 请求
   */
  public async execute(request: AIRequest): Promise<AIResponse> {
    // 验证模型支持
    if (!this.isModelSupported(request.model)) {
      throw new AIError(
        AIErrorCode.INVALID_REQUEST,
        `Model ${request.model} is not supported by Anthropic provider`,
        { supportedModels: this.supportedModels }
      );
    }

    // 分离 system message
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const completion = await this.client.messages.create({
        model: request.model,
        messages,
        system: systemMessage?.content,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        top_p: request.topP,
        stop_sequences: request.stop,
      });

      if (!completion.content || completion.content.length === 0) {
        throw new AIError(
          AIErrorCode.SERVER_ERROR,
          'Invalid response from Anthropic',
          { completion }
        );
      }

      const textContent = completion.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new AIError(
          AIErrorCode.SERVER_ERROR,
          'No text content in Anthropic response',
          { completion }
        );
      }

      const usageMetrics: AIUsageMetrics = {
        promptTokens: completion.usage.input_tokens,
        completionTokens: completion.usage.output_tokens,
        totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
        estimatedCost: this.calculateCost(
          {
            promptTokens: completion.usage.input_tokens,
            completionTokens: completion.usage.output_tokens,
            totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
            estimatedCost: 0,
          },
          request.model
        ),
      };

      return {
        id: completion.id,
        content: textContent.text,
        model: request.model,
        usage: usageMetrics,
        finishReason: completion.stop_reason === 'end_turn' ? 'stop' : completion.stop_reason as any,
        createdAt: new Date(),
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 计算费用
   */
  protected calculateCost(usage: AIUsageMetrics, model: AIModel): number {
    const pricing = ANTHROPIC_PRICING[model];
    if (!pricing) {
      console.warn(`No pricing info for model ${model}, returning 0`);
      return 0;
    }

    const inputCost = (usage.promptTokens / 1000000) * pricing.input;
    const outputCost = (usage.completionTokens / 1000000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * 处理 Anthropic 错误
   */
  private handleError(error: any): AIError {
    // Anthropic SDK 错误
    if (error instanceof Anthropic.APIError) {
      // 认证错误
      if (error.status === 401) {
        return new AIError(
          AIErrorCode.INVALID_API_KEY,
          'Invalid Anthropic API key',
          { originalError: error.message }
        );
      }

      // 速率限制
      if (error.status === 429) {
        return new AIError(
          AIErrorCode.RATE_LIMIT_EXCEEDED,
          'Anthropic rate limit exceeded',
          { originalError: error.message },
          true // 可重试
        );
      }

      // 请求错误
      if (error.status === 400) {
        return new AIError(
          AIErrorCode.INVALID_REQUEST,
          'Invalid request to Anthropic',
          { originalError: error.message }
        );
      }

      // 服务器错误
      if (error.status && error.status >= 500) {
        return new AIError(
          AIErrorCode.SERVER_ERROR,
          'Anthropic server error',
          { originalError: error.message },
          true // 可重试
        );
      }
    }

    // 超时错误
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return new AIError(
        AIErrorCode.TIMEOUT,
        'Anthropic request timeout',
        { originalError: error.message },
        true // 可重试
      );
    }

    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new AIError(
        AIErrorCode.NETWORK_ERROR,
        'Network error connecting to Anthropic',
        { originalError: error.message },
        true // 可重试
      );
    }

    // 未知错误
    return new AIError(
      AIErrorCode.UNKNOWN_ERROR,
      error.message || 'Unknown error occurred',
      { originalError: error }
    );
  }
}
