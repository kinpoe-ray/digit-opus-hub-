# UI/UX 设计文档

> **设计者**: multi-platform-apps__ui-ux-designer
> **日期**: 2025-10-29

## 设计系统

### 色彩方案

```css
/* 主色调 */
--primary: #2563eb;        /* 蓝色 - 主要操作 */
--primary-dark: #1e40af;
--primary-light: #60a5fa;

/* 辅助色 */
--success: #10b981;        /* 绿色 - 成功状态 */
--warning: #f59e0b;        /* 橙色 - 警告 */
--error: #ef4444;          /* 红色 - 错误 */
--info: #3b82f6;           /* 蓝色 - 信息 */

/* 中性色 */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* 特殊用途 */
--agent-online: #10b981;   /* Agent 在线 */
--agent-offline: #ef4444;   /* Agent 离线 */
--agent-busy: #f59e0b;      /* Agent 忙碌 */
```

### 排版系统

```css
/* 字体 */
--font-sans: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 字号 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* 行高 */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 间距系统

```css
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
```

## 核心页面设计

### 1. Dashboard（仪表板）

**布局结构**:
- 顶部导航栏（固定）
- 侧边栏（可收起）
- 主内容区（统计卡片 + 图表 + 活动流）

**关键指标卡片设计**:
```
┌─────────────────────────┐
│ 📊 Total Agents         │
│     24                  │
│ 🟢 18  🔴 6             │
│ ────────────────        │
│ +12% from last week     │
└─────────────────────────┘
```

**响应式适配**:
- Desktop (> 1024px): 4 列网格
- Tablet (768-1024px): 2 列网格
- Mobile (< 768px): 1 列堆叠

### 2. Agent 列表

**卡片设计**:
```
┌────────────────────────────────────┐
│  🤖                        [•••]   │
│  客服机器人                         │
│  🟢 Online  |  Type: Chat          │
│  ─────────────────────────────     │
│  Success Rate: 96.5%               │
│  Total Tasks: 1,245                │
│  Last Active: 2 minutes ago        │
│  ─────────────────────────────     │
│  [View Details]  [Settings]        │
└────────────────────────────────────┘
```

**交互状态**:
- Hover: 轻微提升 + 阴影加深
- Active: 边框高亮
- Selected: 背景色变化

### 3. 任务详情

**时间线视图**:
```
10:30:15  ● Task Created
          │
10:30:16  ● Assigned to Agent
          │ Agent: 客服Bot
          │
10:30:17  ● Execution Started
          │
10:30:21  ● LLM API Called
          │ Model: gpt-4
          │ Tokens: 1,245
          │
10:30:22  ✓ Task Completed
```

### 4. 工作流编辑器

**节点设计**:
```
┌─────────────────┐
│  🤖 Agent Node  │
│  ─────────────  │
│  客服机器人      │
│  ○             │
│     ↓           │
│  ○              │
└─────────────────┘
```

**连接线**:
- 默认: 灰色实线
- 激活: 蓝色实线
- 条件分支: 虚线

## 组件库

### 按钮

```tsx
<Button variant="primary" size="md">
  Create Agent
</Button>

// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg
```

### 表单

```tsx
<Input
  label="Agent Name"
  placeholder="Enter agent name"
  error={errors.name?.message}
/>

<Select
  label="Agent Type"
  options={agentTypes}
  onChange={handleChange}
/>
```

### 状态指示器

```tsx
<StatusBadge status="online" />   // 🟢 Online
<StatusBadge status="offline" />  // 🔴 Offline
<StatusBadge status="busy" />     // 🟡 Busy
```

## 动画和过渡

### 页面切换
```css
.page-transition {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 加载状态
- Skeleton Screen（骨架屏）
- Spinner（加载图标）
- Progress Bar（进度条）

## 可访问性 (A11y)

- ✅ 键盘导航支持
- ✅ ARIA 标签
- ✅ 颜色对比度 >= 4.5:1
- ✅ 屏幕阅读器兼容
- ✅ Focus 状态清晰可见

## 响应式断点

```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

## Figma 设计稿

🎨 设计稿链接: [待补充]

---

**设计原则**: 简洁、直观、高效
