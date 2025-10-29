/**
 * OpenAI Provider Implementation
 */

import OpenAI from 'openai';
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

// Optional tiktoken import with fallback
let encoding_for_model: any = null;
try {
  const tiktoken = require('tiktoken');
  encoding_for_model = tiktoken.encoding_for_model;
} catch (e) {
  console.warn('⚠️  tiktoken not available, using fallback token estimation');
}

// OpenAI 定价（美元/1K tokens）- 2024年1月价格
const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

export class OpenAIProvider extends AIProvider {
  public readonly type = AIProviderType.OPENAI;
  public readonly supportedModels = [
    AIModel.GPT_4,
    AIModel.GPT_4_TURBO,
    AIModel.GPT_3_5_TURBO,
  ];

  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      timeout: config.timeout || 60000,
      maxRetries: 0, // 我们自己处理重试
    });
  }

  /**
   * 执行 OpenAI 请求
   */
  public async execute(request: AIRequest): Promise<AIResponse> {
    // 验证模型支持
    if (!this.isModelSupported(request.model)) {
      throw new AIError(
        AIErrorCode.INVALID_REQUEST,
        `Model ${request.model} is not supported by OpenAI provider`,
        { supportedModels: this.supportedModels }
      );
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        stream: false,
      });

      const choice = completion.choices[0];
      const usage = completion.usage;

      if (!choice || !usage) {
        throw new AIError(
          AIErrorCode.SERVER_ERROR,
          'Invalid response from OpenAI',
          { completion }
        );
      }

      const usageMetrics: AIUsageMetrics = {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        estimatedCost: this.calculateCost(
          {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
            estimatedCost: 0,
          },
          request.model
        ),
      };

      return {
        id: completion.id,
        content: choice.message.content || '',
        model: request.model,
        usage: usageMetrics,
        finishReason: choice.finish_reason as any,
        createdAt: new Date(completion.created * 1000),
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 计算费用
   */
  protected calculateCost(usage: AIUsageMetrics, model: AIModel): number {
    const pricing = OPENAI_PRICING[model];
    if (!pricing) {
      console.warn(`No pricing info for model ${model}, returning 0`);
      return 0;
    }

    const inputCost = (usage.promptTokens / 1000) * pricing.input;
    const outputCost = (usage.completionTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * 处理 OpenAI 错误
   */
  private handleError(error: any): AIError {
    // OpenAI SDK 错误
    if (error instanceof OpenAI.APIError) {
      // 认证错误
      if (error.status === 401) {
        return new AIError(
          AIErrorCode.INVALID_API_KEY,
          'Invalid OpenAI API key',
          { originalError: error.message }
        );
      }

      // 速率限制
      if (error.status === 429) {
        return new AIError(
          AIErrorCode.RATE_LIMIT_EXCEEDED,
          'OpenAI rate limit exceeded',
          { originalError: error.message },
          true // 可重试
        );
      }

      // 配额不足
      if (error.status === 402) {
        return new AIError(
          AIErrorCode.INSUFFICIENT_QUOTA,
          'OpenAI quota exceeded',
          { originalError: error.message }
        );
      }

      // 请求错误
      if (error.status === 400) {
        return new AIError(
          AIErrorCode.INVALID_REQUEST,
          'Invalid request to OpenAI',
          { originalError: error.message }
        );
      }

      // 服务器错误
      if (error.status && error.status >= 500) {
        return new AIError(
          AIErrorCode.SERVER_ERROR,
          'OpenAI server error',
          { originalError: error.message },
          true // 可重试
        );
      }
    }

    // 超时错误
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return new AIError(
        AIErrorCode.TIMEOUT,
        'OpenAI request timeout',
        { originalError: error.message },
        true // 可重试
      );
    }

    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new AIError(
        AIErrorCode.NETWORK_ERROR,
        'Network error connecting to OpenAI',
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

  /**
   * 估算 token 数量（用于预算控制，不用于计费）
   */
  public static estimateTokens(text: string, model: AIModel): number {
    if (encoding_for_model) {
      try {
        const enc = encoding_for_model(model as any);
        const tokens = enc.encode(text);
        enc.free();
        return tokens.length;
      } catch (error) {
        // fallback on tiktoken error
      }
    }
    // fallback: 粗略估算（1 token ≈ 4 字符）
    return Math.ceil(text.length / 4);
  }
}
