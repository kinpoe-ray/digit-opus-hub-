/**
 * AI Provider Factory
 * 根据配置动态创建对应的 AI Provider 实例
 */

import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AIError,
  AIErrorCode,
} from '../types';

type ProviderConstructor = new (config: AIProviderConfig) => AIProvider;

export class ProviderFactory {
  private static providers: Map<AIProviderType, ProviderConstructor> = new Map();

  /**
   * 注册 Provider
   */
  public static register(type: AIProviderType, provider: ProviderConstructor): void {
    this.providers.set(type, provider);
  }

  /**
   * 创建 Provider 实例
   */
  public static create(type: AIProviderType, config: AIProviderConfig): AIProvider {
    const ProviderClass = this.providers.get(type);

    if (!ProviderClass) {
      throw new AIError(
        AIErrorCode.INVALID_REQUEST,
        `Provider type "${type}" is not registered`,
        { availableProviders: Array.from(this.providers.keys()) }
      );
    }

    return new ProviderClass(config);
  }

  /**
   * 检查 Provider 是否已注册
   */
  public static isRegistered(type: AIProviderType): boolean {
    return this.providers.has(type);
  }

  /**
   * 获取所有已注册的 Provider 类型
   */
  public static getRegisteredProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
}
