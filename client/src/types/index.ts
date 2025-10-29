// 用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// Agent 类型
export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
}

export enum AgentType {
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  DATA_ANALYST = 'DATA_ANALYST',
  CUSTOM = 'CUSTOM',
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description?: string;
  config: Record<string, any>;
  status: AgentStatus;
  ownerId: string;
  totalTasks: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

// 任务类型
export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: TaskStatus;
  priority: TaskPriority;
  input: Record<string, any>;
  output?: Record<string, any>;
  agentId: string;
  userId: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 仪表板统计
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  todayTasks: number;
}

// API 响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
