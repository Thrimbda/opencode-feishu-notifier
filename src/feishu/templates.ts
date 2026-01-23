import type {
  MessageContext,
  MessageTemplate,
  ReasonConfig,
  ReasonConfigMap,
} from "../types";
import type { NotificationType } from "./messages";

import { createProgressInfo, formatProgressInfo } from "../context/progress";
import { extractProjectContext } from "../context/project";

/**
 * 事件原因配置映射
 */
const REASON_CONFIGS = {
  session_idle: {
    category: "闲暇等待",
    description: "已完成当前任务，等待下一步指示",
    requiresAction: true,
    emoji: "💤",
  },
  permission_required: {
    category: "需要权限",
    description: "需要访问文件权限才能继续",
    requiresAction: true,
    emoji: "🔐",
  },
  question_asked: {
    category: "需要选择",
    description: "提供了多个方案，需要你选择",
    requiresAction: true,
    emoji: "❓",
  },
  interaction_required: {
    category: "需要输入",
    description: "需要你提供额外信息",
    requiresAction: true,
    emoji: "✏️",
  },
  command_args_required: {
    category: "参数缺失",
    description: "命令需要额外参数才能执行",
    requiresAction: true,
    emoji: "⚙️",
  },
  confirmation_required: {
    category: "需要确认",
    description: "需要你确认是否继续操作",
    requiresAction: true,
    emoji: "✅",
  },
  setup_test: {
    category: "测试通知",
    description: "飞书通知功能测试",
    requiresAction: false,
    emoji: "🧪",
  },
} as const satisfies ReasonConfigMap;

/**
 * 获取事件类型的中文标题
 */
function getEventTitle(eventType: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    interaction_required: "需要交互",
    permission_required: "需要权限",
    command_args_required: "缺少参数",
    confirmation_required: "需要确认",
    session_idle: "任务完成",
    question_asked: "请做选择",
    setup_test: "测试通知",
  };

  return titles[eventType];
}

/**
 * 权限类型中文映射
 */
const PERMISSION_TYPE_LABELS: Record<string, string> = {
  read: "读取",
  write: "写入",
  execute: "执行",
  edit: "编辑",
  bash: "命令行",
  webfetch: "网络请求",
  external_directory: "外部目录",
};

/**
 * 从事件负载中提取具体操作说明
 * 根据不同事件类型提取对应的详细信息
 */
function extractActionDetails(
  eventPayload?: unknown,
  originalEventType?: string
): string[] {
  const details: string[] = [];

  if (!eventPayload) {
    return details;
  }

  if (typeof eventPayload !== "object" || eventPayload === null) {
    return details;
  }

  const payload = eventPayload as Record<string, unknown>;

  // ========== permission.updated / permission.asked ==========
  if (
    originalEventType === "permission.updated" ||
    originalEventType === "permission.asked"
  ) {
    const permType = payload.type as string | undefined;
    const pattern = payload.pattern as string | string[] | undefined;
    const title = payload.title as string | undefined;

    if (title) {
      details.push(`- ${title}`);
    }

    if (permType) {
      const typeLabel = PERMISSION_TYPE_LABELS[permType] || permType;
      details.push(`- 权限类型: ${typeLabel}`);
    }

    if (pattern) {
      if (Array.isArray(pattern)) {
        details.push(`- 涉及路径:`);
        pattern.forEach((p) => {
          details.push(`  - ${p}`);
        });
      } else {
        details.push(`- 涉及路径: ${pattern}`);
      }
    }

    return details;
  }

  // ========== tui.prompt.append ==========
  if (originalEventType === "tui.prompt.append") {
    const text = payload.text as string | undefined;
    if (text) {
      details.push(`- 提示内容: ${text}`);
    }
    return details;
  }

  // ========== tui.command.execute ==========
  if (originalEventType === "tui.command.execute") {
    const command = payload.command as string | undefined;
    if (command) {
      details.push(`- 命令: ${command}`);
    }
    return details;
  }

  // ========== tui.toast.show ==========
  if (originalEventType === "tui.toast.show") {
    const title = payload.title as string | undefined;
    const message = payload.message as string | undefined;

    if (title) {
      details.push(`- 标题: ${title}`);
    }
    if (message) {
      details.push(`- 内容: ${message}`);
    }
    return details;
  }

  // ========== session.status ==========
  if (originalEventType === "session.status") {
    const status = payload.status as Record<string, unknown> | undefined;
    if (status) {
      const statusType = status.type as string | undefined;
      if (statusType === "idle") {
        details.push(`- 状态: 空闲，等待指令`);
      } else if (statusType === "busy") {
        details.push(`- 状态: 忙碌中`);
      } else if (statusType === "retry") {
        const attempt = status.attempt as number | undefined;
        const message = status.message as string | undefined;
        details.push(`- 状态: 重试中 (第 ${attempt || "?"} 次)`);
        if (message) {
          details.push(`- 原因: ${message}`);
        }
      }
    }
    return details;
  }

  // ========== question.asked (通用选项处理) ==========
  if (payload.options && Array.isArray(payload.options)) {
    const options = payload.options as Array<{
      label?: string;
      description?: string;
    }>;
    if (options.length > 0) {
      details.push(`可选方案:`);
      options.forEach((option, index) => {
        const label = option.label || `选项 ${index + 1}`;
        const desc = option.description ? ` - ${option.description}` : "";
        details.push(`  ${index + 1}. ${label}${desc}`);
      });
    }
    return details;
  }

  // ========== 通用字段处理 ==========

  if (payload.prompt && typeof payload.prompt === "string") {
    details.push(`- 提示: ${payload.prompt}`);
  }

  if (payload.message && typeof payload.message === "string") {
    details.push(`- 消息: ${payload.message}`);
  }

  if (payload.title && typeof payload.title === "string" && details.length === 0) {
    details.push(`- ${payload.title}`);
  }

  if (payload.action && typeof payload.action === "string") {
    details.push(`- 操作: ${payload.action}`);
  }

  if (payload.args && Array.isArray(payload.args)) {
    const args = payload.args as string[];
    if (args.length > 0) {
      details.push(`- 参数:`);
      args.forEach((arg) => {
        details.push(`  - --${arg}`);
      });
    }
  }

  return details;
}

/**
 * 构建头部区域 - 醒目的标题行
 */
function buildHeader(context: MessageContext): string {
  const { eventType } = context;
  const config = REASON_CONFIGS[eventType];
  const title = getEventTitle(eventType);

  return `${config.emoji} **${title}**`;
}

/**
 * 构建环境信息区域
 */
function buildEnvironment(context: MessageContext): string {
  const { project, sessionTitle, sessionID, agentName } = context;
  const lines: string[] = [];

  lines.push("**🖥️ 环境**");

  if (project.hostname) {
    lines.push(`- 主机: ${project.hostname}`);
  }

  lines.push(`- 项目: ${project.projectName}`);

  if (project.branch) {
    lines.push(`- 分支: ${project.branch}`);
  }

  if (sessionTitle || sessionID) {
    const sessionLabel = sessionTitle || sessionID || "";
    lines.push(`- 会话: ${sessionLabel}`);
  }

  if (agentName) {
    lines.push(`- Agent: ${agentName}`);
  }

  return lines.join("\n");
}

/**
 * 构建原因说明区域
 */
function buildReason(context: MessageContext): string {
  const { eventType, eventPayload, originalEventType } = context;
  const config = REASON_CONFIGS[eventType];
  const lines: string[] = [];

  lines.push("**💡 说明**");
  lines.push(config.description);

  // 添加具体操作说明
  const actionDetails = extractActionDetails(eventPayload, originalEventType);
  if (actionDetails.length > 0) {
    lines.push("");
    actionDetails.forEach((detail) => lines.push(detail));
  }

  // 对于需要确认的操作，添加警告
  if (eventType === "confirmation_required") {
    lines.push("");
    lines.push("⚠️ 请谨慎确认此操作");
  }

  return lines.join("\n");
}

/**
 * 构建工作目录信息
 */
function buildWorkdir(context: MessageContext): string {
  const { project } = context;
  const lines: string[] = [];

  lines.push("**📂 路径**");
  lines.push(`- 目录: ${project.workingDir}`);

  if (project.isGitRepo && project.repoUrl) {
    lines.push(`- 仓库: ${project.repoUrl}`);
  }

  return lines.join("\n");
}

/**
 * 构建时间戳
 */
function buildTimestamp(): string {
  const now = new Date();
  const timeStr = now.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `⏰ ${timeStr}`;
}

/**
 * 美观消息模板实现
 */
export class BeautifulMessageTemplate implements MessageTemplate {
  buildTitle(context: MessageContext): string {
    return buildHeader(context);
  }

  buildReason(context: MessageContext): string {
    return buildReason(context);
  }

  buildProgress(context: MessageContext): string {
    return buildEnvironment(context);
  }

  buildFullMessage(context: MessageContext): string {
    const header = buildHeader(context);
    const environment = buildEnvironment(context);
    const reason = buildReason(context);
    const workdir = buildWorkdir(context);
    const timestamp = buildTimestamp();

    // 组装完整消息
    const sections = [
      header,
      "",
      environment,
      "",
      reason,
      "",
      workdir,
      "",
      timestamp,
    ];

    return sections.join("\n");
  }
}

/**
 * 默认消息模板实现（保留向后兼容）
 */
export class DefaultMessageTemplate implements MessageTemplate {
  buildTitle(context: MessageContext): string {
    const { project, eventType } = context;
    const eventTitle = getEventTitle(eventType);

    let title = `📦 [${project.projectName}]`;

    if (project.branch) {
      title += ` ${project.branch}`;
    }

    if (project.hostname) {
      title += ` @${project.hostname}`;
    }

    title += ` | ${eventTitle}`;

    return title;
  }

  buildReason(context: MessageContext): string {
    const { eventType, eventPayload, originalEventType } = context;
    const config = REASON_CONFIGS[eventType];

    const lines: string[] = [];
    lines.push(`🔔 原因：${config.category}`);
    lines.push(config.description);

    const actionDetails = extractActionDetails(eventPayload, originalEventType);
    if (actionDetails.length > 0) {
      lines.push("");
      actionDetails.forEach((detail) => lines.push(detail));
    }

    if (eventType === "confirmation_required") {
      lines.push("");
      lines.push("⚠️ 此操作可能需要谨慎确认。");
    }

    return lines.join("\n");
  }

  buildProgress(context: MessageContext): string {
    const { project, progress, sessionID, sessionTitle, agentName } = context;

    const lines: string[] = [];
    lines.push("📊 进度摘要");

    lines.push(`• 工作目录：${project.workingDir}`);

    if (sessionTitle || sessionID) {
      const label = sessionTitle ?? sessionID ?? "";
      const suffix = sessionTitle && sessionID ? ` (${sessionID})` : "";
      lines.push(`• 会话：${label}${suffix}`);
    }

    if (agentName) {
      lines.push(`• Agent：${agentName}`);
    }

    const progressText = formatProgressInfo(progress);
    if (progressText) {
      const progressLines = progressText.split("\n");
      progressLines.forEach((line: string) => {
        if (line.trim()) {
          lines.push(line);
        }
      });
    }

    if (project.isGitRepo && project.repoUrl) {
      lines.push(`• 仓库地址：${project.repoUrl}`);
    }

    return lines.join("\n");
  }

  buildFullMessage(context: MessageContext): string {
    const title = this.buildTitle(context);
    const reason = this.buildReason(context);
    const progress = this.buildProgress(context);

    return `${title}\n\n${reason}\n\n${progress}`;
  }
}

/**
 * 创建消息模板实例（默认使用美观模板）
 */
export function createMessageTemplate(): MessageTemplate {
  return new BeautifulMessageTemplate();
}

/**
 * 根据事件类型获取原因配置
 */
export function getReasonConfig(eventType: NotificationType): ReasonConfig {
  return REASON_CONFIGS[eventType] as ReasonConfig;
}

/**
 * 构建完整的消息上下文
 */
export async function buildMessageContext(
  eventType: NotificationType,
  eventPayload?: unknown,
  originalEventType?: string,
  directory?: string,
  sessionContext?: {
    sessionID?: string;
    sessionTitle?: string;
    agentName?: string;
  }
): Promise<MessageContext> {
  const project = await extractProjectContext(directory || process.cwd());
  const progress = createProgressInfo(eventPayload, directory || process.cwd());

  return {
    project,
    progress,
    eventType,
    eventPayload,
    originalEventType,
    sessionID: sessionContext?.sessionID,
    sessionTitle: sessionContext?.sessionTitle,
    agentName: sessionContext?.agentName,
  };
}

/**
 * 快速构建消息（简化接口）
 */
export async function buildStructuredMessage(
  eventType: NotificationType,
  eventPayload?: unknown,
  originalEventType?: string,
  directory?: string,
  sessionContext?: {
    sessionID?: string;
    sessionTitle?: string;
    agentName?: string;
  }
): Promise<string> {
  const context = await buildMessageContext(
    eventType,
    eventPayload,
    originalEventType,
    directory,
    sessionContext
  );

  const template = createMessageTemplate();
  return template.buildFullMessage(context);
}
