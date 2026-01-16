import type { NotificationType } from "./feishu/messages";

/**
 * 项目上下文信息
 * 包含项目名称、分支、工作目录等基本信息
 */
export interface ProjectContext {
  /** 项目名称，从 package.json 或目录名提取 */
  projectName: string;
  /** Git 当前分支名（如果项目是 git 仓库） */
  branch?: string;
  /** 工作目录绝对路径 */
  workingDir: string;
  /** 仓库 URL（如果是 git 项目） */
  repoUrl?: string;
  /** 是否 Git 仓库 */
  isGitRepo: boolean;
}

/**
 * 进度信息
 * 包含当前任务状态和进度摘要
 */
export interface ProgressInfo {
  /** 最近的操作描述 */
  lastAction?: string;
  /** 当前任务描述（如果可获取） */
  currentTask?: string;
  /** 时间戳 */
  timestamp: string;
  /** 工作目录中的文件变更信息 */
  fileChanges?: {
    /** 新增文件数 */
    added?: number;
    /** 修改文件数 */
    modified?: number;
    /** 删除文件数 */
    deleted?: number;
  };
}

/**
 * 消息上下文
 * 构建消息所需的所有上下文信息
 */
export interface MessageContext {
  /** 项目上下文 */
  project: ProjectContext;
  /** 进度信息 */
  progress: ProgressInfo;
  /** 事件类型 */
  eventType: NotificationType;
  /** 原始事件负载 */
  eventPayload?: unknown;
  /** 事件原始类型 */
  originalEventType?: string;
}

/**
 * 消息模板接口
 * 定义三段式消息的构建方法
 */
export interface MessageTemplate {
  /** 构建标题区域：项目名 + 分支 + 事件类型 */
  buildTitle(context: MessageContext): string;

  /** 构建原因区域：为什么发送通知 + 具体说明 */
  buildReason(context: MessageContext): string;

  /** 构建进度区域：工作目录 + 最近操作 + 当前任务 */
  buildProgress(context: MessageContext): string;

  /** 构建完整消息 */
  buildFullMessage(context: MessageContext): string;
}

/**
 * 事件原因说明配置
 */
export interface ReasonConfig {
  /** 原因分类：闲暇等待/需要权限/需要选择等 */
  category: string;
  /** 原因说明文案 */
  description: string;
  /** 是否需要具体操作说明 */
  requiresAction: boolean;
}

/**
 * 事件类型到原因配置的映射
 */
export type ReasonConfigMap = Record<NotificationType, ReasonConfig>;
