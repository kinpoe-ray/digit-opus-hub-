/**
 * AI Provider 统一接口
 * 支持 OpenAI, Anthropic, Google Gemini 等多种 AI 服务
 */

// ==================== 模型定义 ====================

export enum AIModel {
  // OpenAI Models
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo-preview',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',

  // Anthropic Models
  CLAUDE_3_OPUS = 'claude-3-opus-20240229',
  CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',

  // Google Models (预留)
  GEMINI_PRO = 'gemini-pro',
  GEMINI_PRO_VISION = 'gemini-pro-vision',
}

export enum AIProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
}

// ==================== 请求/响应类型 ====================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model: AIModel;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface AIResponse {
  id: string;
  content: string;
  model: AIModel;
  usage: AIUsageMetrics;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  createdAt: Date;
}

export interface AIUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number; // 以美元计算
}

// ==================== 配置类型 ====================

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string; // OpenAI org ID
  timeout?: number; // 毫秒
  maxRetries?: number;
  defaultModel?: AIModel;
}

// ==================== 错误类型 ====================

export enum AIErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_QUOTA = 'INSUFFICIENT_QUOTA',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AIError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// ==================== 监控类型 ====================

export interface AIExecutionMetrics {
  startTime: Date;
  endTime: Date;
  duration: number; // 毫秒
  model: AIModel;
  provider: AIProviderType;
  success: boolean;
  error?: AIError;
  usage: AIUsageMetrics;
  retryCount: number;
}

// ==================== 抽象 Provider 接口 ====================

export abstract class AIProvider {
  protected config: AIProviderConfig;
  public abstract readonly type: AIProviderType;
  public abstract readonly supportedModels: AIModel[];

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * 验证配置
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new AIError(
        AIErrorCode.INVALID_API_KEY,
        'API key is required',
        { provider: this.type }
      );
    }
  }

  /**
   * 检查模型是否支持
   */
  public isModelSupported(model: AIModel): boolean {
    return this.supportedModels.includes(model);
  }

  /**
   * 执行 AI 请求
   */
  public abstract execute(request: AIRequest): Promise<AIResponse>;

  /**
   * 计算费用（每个 Provider 的定价不同）
   */
  protected abstract calculateCost(usage: AIUsageMetrics, model: AIModel): number;

  /**
   * 执行请求并记录指标
   */
  public async executeWithMetrics(request: AIRequest): Promise<{
    response: AIResponse;
    metrics: AIExecutionMetrics;
  }> {
    const startTime = new Date();
    let retryCount = 0;
    const maxRetries = this.config.maxRetries || 3;

    while (retryCount <= maxRetries) {
      try {
        const response = await this.execute(request);
        const endTime = new Date();

        const metrics: AIExecutionMetrics = {
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          model: request.model,
          provider: this.type,
          success: true,
          usage: response.usage,
          retryCount,
        };

        return { response, metrics };
      } catch (error) {
        retryCount++;

        if (error instanceof AIError && error.retryable && retryCount <= maxRetries) {
          // 指数退避
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // 不可重试或达到最大重试次数
        const endTime = new Date();
        const aiError = error instanceof AIError ? error : new AIError(
          AIErrorCode.UNKNOWN_ERROR,
          error instanceof Error ? error.message : 'Unknown error'
        );

        const metrics: AIExecutionMetrics = {
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          model: request.model,
          provider: this.type,
          success: false,
          error: aiError,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
          retryCount,
        };

        throw { error: aiError, metrics };
      }
    }

    throw new AIError(AIErrorCode.UNKNOWN_ERROR, 'Unexpected error in retry loop');
  }
}
