# 飞书智能消息引擎

## 目标

为各类事件设计结构化的飞书通知消息内容模板，包含项目信息、事件原因和进度总结


## 现状分析

### 当前实现问题
1. **信息贫乏**：消息仅包含 `[OpenCode] ${标题}\n事件类型: ${event.type}\n详情: ${JSON.stringify(payload)}`
2. **缺少上下文**：不知道是哪个项目、哪个分支、什么工作目录触发的通知
3. **原因不明确**：收到通知不清楚为什么需要关注（是闲暇等待？遇到问题？需要权限？）
4. **无进度信息**：不知道当前任务进行到哪一步，无法快速判断优先级

### 现有代码结构
- `src/index.ts`: 插件主入口，监听事件并发送通知
- `src/hooks.ts`: 事件映射，将 OpenCode 事件映射到通知类型
- `src/feishu/messages.ts`: 消息构建（**当前仅简单拼接文本**）
- `src/feishu/client.ts`: 飞书 API 客户端
- `src/config.ts`: 配置加载


## 设计方案

### 消息结构设计（三段式）

```
┌─────────────────────────────────────┐
│ 📦 [项目名] 分支名 | 事件类型        │  ← 标题区
├─────────────────────────────────────┤
│ 🔔 原因：为什么发送这条通知          │  ← 原因区
│   • 当前状态说明                     │
│   • 需要什么操作                     │
├─────────────────────────────────────┤
│ 📊 进度摘要                          │  ← 进度区
│   • 工作目录：/path/to/project       │
│   • 最近操作：xxx                    │
│   • 当前任务：xxx (可选)             │
└─────────────────────────────────────┘
```

### 事件分类与原因说明

| 事件类型 | 原因分类 | 说明文案 |
|---------|---------|---------|
| `session_idle` | 闲暇等待 | "OpenCode 已完成当前任务，等待你的下一步指示" |
| `permission_required` | 需要权限 | "OpenCode 需要访问文件权限才能继续" |
| `question_asked` | 需要选择 | "OpenCode 提供了多个方案，需要你选择一个" |
| `interaction_required` | 需要输入 | "OpenCode 需要你提供额外信息" |
| `command_args_required` | 参数缺失 | "命令需要额外参数才能执行" |
| `confirmation_required` | 需要确认 | "OpenCode 需要你确认是否继续操作" |


## 消息示例

### 示例 1：会话闲置（session_idle）
```
📦 [opencode-feishu-notifier] main | OpenCode 闲暇

🔔 原因：任务已完成，等待指示
OpenCode 已完成当前任务，正在等待你的下一步指示。

📊 进度摘要
• 工作目录：~/Work/opencode-feishu-notifier
• 最近操作：完成代码审查和测试
• 时间：2026-01-16 16:45:23
```

### 示例 2：需要权限（permission_required）
```
📦 [my-backend-api] feature/user-auth | 需要权限确认

🔔 原因：需要文件访问权限
OpenCode 需要访问以下文件才能继续：
• src/auth/jwt.service.ts
• src/config/security.json

📊 进度摘要
• 工作目录：~/Projects/my-backend-api
• 当前任务：实现 JWT 认证中间件
• 时间：2026-01-16 14:20:15
```

### 示例 3：需要选择方案（question_asked）
```
📦 [frontend-dashboard] develop | 需要选择方案

🔔 原因：有多个实现方案可选
OpenCode 提供了以下方案，请选择一个：
1. 使用 Redux Toolkit 管理状态
2. 使用 Zustand 轻量状态管理
3. 使用 React Context + useReducer

📊 进度摘要
• 工作目录：~/Projects/frontend-dashboard
• 当前任务：重构全局状态管理
• 时间：2026-01-16 10:30:42
```

### 示例 4：需要交互输入（interaction_required）
```
📦 [data-pipeline] hotfix/csv-parser | 需要交互

🔔 原因：需要补充信息
OpenCode 需要你提供以下信息：
• CSV 文件的字段分隔符（默认为逗号）
• 是否包含表头行

📊 进度摘要
• 工作目录：~/Work/data-pipeline
• 当前任务：修复 CSV 解析器 bug
• 时间：2026-01-16 09:15:30
```

### 示例 5：命令参数缺失（command_args_required）
```
📦 [deploy-scripts] main | 需要补充参数

🔔 原因：命令缺少必需参数
执行的命令需要以下参数：
• --environment: 部署环境（staging/production）
• --version: 版本号

📊 进度摘要
• 工作目录：~/DevOps/deploy-scripts
• 最近操作：准备部署配置
• 时间：2026-01-16 15:50:10
```

### 示例 6：需要确认（confirmation_required）
```
📦 [legacy-system] refactor/db-migration | 需要确认

🔔 原因：操作需要你的确认
OpenCode 准备执行以下操作：
• 删除 12 个已废弃的数据库迁移文件
• 更新数据库版本控制配置

此操作不可逆，请确认是否继续。

📊 进度摘要
• 工作目录：~/Projects/legacy-system
• 当前任务：清理历史迁移文件
• 时间：2026-01-16 11:25:55
```

### 核心功能模块

#### 1. 项目上下文提取 (`src/context/project.ts`)
```typescript
interface ProjectContext {
  projectName: string      // 从 package.json 或目录名提取
  branch?: string          // 从 git 获取当前分支
  workingDir: string       // 工作目录路径
  repoUrl?: string         // 仓库 URL（如果是 git 项目）
}
```

#### 2. 进度信息收集 (`src/context/progress.ts`)
```typescript
interface ProgressInfo {
  lastAction?: string      // 最近的操作描述
  currentTask?: string     // 当前任务（如果可获取）
  timestamp: string        // 时间戳
}
```

#### 3. 消息模板系统 (`src/feishu/templates.ts`)
```typescript
interface MessageTemplate {
  buildTitle(context: ProjectContext, eventType: NotificationType): string
  buildReason(eventType: NotificationType, payload?: unknown): string
  buildProgress(context: ProjectContext, progress: ProgressInfo): string
}
```


## 技术要点

- 【现状分析】当前消息格式简陋：仅包含事件类型 + JSON payload，信息缺失严重
- 【核心问题】缺少关键上下文：项目名称、当前分支、工作目录、任务进度等信息
- 【设计目标】设计智能消息模板，自动提取并展示：①项目上下文 ②事件原因分类 ③进度摘要
- 【技术方案】消息内容分层设计：标题区（项目+事件）+ 原因区（为何通知）+ 进度区（当前状态）
- 【实现路径】新增 context 模块提取项目信息 + 重构 messages 模块支持模板化 + 集成进度报告生成


## 实施范围

| 文件路径 | 变更类型 | 说明 |
|---------|---------|------|
| `src/feishu/messages.ts` | 重构 | 重构消息构建逻辑，支持结构化模板 |
| `src/context/` | 新增 | 新增目录，包含项目上下文提取模块 |
| `src/context/project.ts` | 新增 | 提取项目名称、分支、工作目录信息 |
| `src/context/progress.ts` | 新增 | 生成任务进度摘要（如果可获取） |
| `src/feishu/templates.ts` | 新增 | 定义各事件类型的消息模板 |
| `src/types.ts` | 新增 | 定义消息上下文和模板的类型定义 |


## 阶段规划

### 阶段1：需求分析与详细设计
- 分析不同事件类型的消息需求，定义各事件的原因说明文案
- 设计消息模板结构和格式，确定字段和布局方式

### 阶段2：项目上下文提取实现
- 实现 `src/context/project.ts`，提取项目名称、分支、目录信息
- 实现 Git 信息提取功能（分支名、仓库 URL）

### 阶段3：消息模板系统实现
- 实现 `src/feishu/templates.ts`，定义各事件类型的模板
- 重构 `src/feishu/messages.ts`，集成模板系统

### 阶段4：进度报告功能实现
- 实现 `src/context/progress.ts`，收集和格式化进度信息
- 集成进度信息到消息生成流程

### 阶段5：集成测试与优化
- 集成所有模块到插件主流程
- 测试各类事件的消息效果，优化格式和内容

---

*创建于: 2026-01-16 | 最后更新: 2026-01-16*
