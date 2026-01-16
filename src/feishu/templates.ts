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
    description: "OpenCode 已完成当前任务，等待你的下一步指示。",
    requiresAction: true,
  },
  permission_required: {
    category: "需要权限",
    description: "OpenCode 需要访问文件权限才能继续。",
    requiresAction: true,
  },
  question_asked: {
    category: "需要选择",
    description: "OpenCode 提供了多个方案，需要你选择一个。",
    requiresAction: true,
  },
  interaction_required: {
    category: "需要输入",
    description: "OpenCode 需要你提供额外信息。",
    requiresAction: true,
  },
  command_args_required: {
    category: "参数缺失",
    description: "命令需要额外参数才能执行。",
    requiresAction: true,
  },
  confirmation_required: {
    category: "需要确认",
    description: "OpenCode 需要你确认是否继续操作。",
    requiresAction: true,
  },
  setup_test: {
    category: "测试通知",
    description: "Feishu 通知功能测试。",
    requiresAction: false,
  },
} as const satisfies ReasonConfigMap;

/**
 * 获取事件类型的中文标题
 */
function getEventTitle(eventType: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    interaction_required: "需要交互",
    permission_required: "需要权限确认",
    command_args_required: "需要补充参数",
    confirmation_required: "需要确认",
    session_idle: "OpenCode 闲暇",
    question_asked: "需要选择方案",
    setup_test: "Feishu 通知测试",
  };

  return titles[eventType];
}

/**
 * 从事件负载中提取具体操作说明
 */
function extractActionDetails(eventPayload?: unknown): string[] {
  const details: string[] = [];

  if (!eventPayload) {
    return details;
  }

  if (typeof eventPayload === "object" && eventPayload !== null) {
    const payload = eventPayload as Record<string, unknown>;

    // 处理权限请求
    if (payload.permissions && Array.isArray(payload.permissions)) {
      const permissions = payload.permissions as Array<{
        path?: string;
        type?: string;
      }>;
      permissions.forEach((perm) => {
        if (perm.path) {
          details.push(`• ${perm.path}`);
        }
      });
    }

    // 处理问题/选择
    if (payload.options && Array.isArray(payload.options)) {
      const options = payload.options as Array<{
        label?: string;
        description?: string;
      }>;
      options.forEach((option, index) => {
        if (option.label || option.description) {
          const label = option.label || `选项 ${index + 1}`;
          const desc = option.description ? ` - ${option.description}` : "";
          details.push(`${index + 1}. ${label}${desc}`);
        }
      });
    }

    // 处理需要输入的信息
    if (payload.prompt) {
      details.push(`• ${String(payload.prompt)}`);
    }

    // 处理命令参数
    if (payload.args && Array.isArray(payload.args)) {
      const args = payload.args as string[];
      args.forEach((arg) => {
        details.push(`• --${arg}: 需要提供值`);
      });
    }

    // 处理需要确认的操作
    if (payload.action && typeof payload.action === "string") {
      details.push(`• ${payload.action}`);
    }

    // 如果有 message 字段，作为通用说明
    if (payload.message && typeof payload.message === "string") {
      if (details.length === 0) {
        details.push(`• ${payload.message}`);
      }
    }
  }

  return details;
}

/**
 * 构建标题区域
 */
function buildTitle(context: MessageContext): string {
  const { project, eventType } = context;
  const eventTitle = getEventTitle(eventType);

  let title = `📦 [${project.projectName}]`;

  if (project.branch) {
    title += ` ${project.branch}`;
  }

  title += ` | ${eventTitle}`;

  return title;
}

/**
 * 构建原因区域
 */
function buildReason(context: MessageContext): string {
  const { eventType, eventPayload } = context;
  const config = REASON_CONFIGS[eventType];

  const lines: string[] = [];
  lines.push(`🔔 原因：${config.category}`);
  lines.push(config.description);

  // 添加具体操作说明
  const actionDetails = extractActionDetails(eventPayload);
  if (actionDetails.length > 0) {
    lines.push("");
    actionDetails.forEach((detail) => lines.push(detail));
  }

  // 对于需要确认的操作，添加警告
  if (eventType === "confirmation_required") {
    lines.push("");
    lines.push("⚠️ 此操作可能需要谨慎确认。");
  }

  return lines.join("\n");
}

/**
 * 构建进度区域
 */
function buildProgress(context: MessageContext): string {
  const { project, progress } = context;

  const lines: string[] = [];
  lines.push("📊 进度摘要");

  // 工作目录信息
  lines.push(`• 工作目录：${project.workingDir}`);

  // 添加进度信息
  const progressText = formatProgressInfo(progress);
  if (progressText) {
    const progressLines = progressText.split("\n");
    progressLines.forEach((line: string) => {
      if (line.trim()) {
        lines.push(line);
      }
    });
  }

  // 如果是 Git 仓库，添加仓库信息
  if (project.isGitRepo && project.repoUrl) {
    lines.push(`• 仓库地址：${project.repoUrl}`);
  }

  return lines.join("\n");
}

/**
 * 默认消息模板实现
 */
export class DefaultMessageTemplate implements MessageTemplate {
  buildTitle(context: MessageContext): string {
    return buildTitle(context);
  }

  buildReason(context: MessageContext): string {
    return buildReason(context);
  }

  buildProgress(context: MessageContext): string {
    return buildProgress(context);
  }

  buildFullMessage(context: MessageContext): string {
    const title = this.buildTitle(context);
    const reason = this.buildReason(context);
    const progress = this.buildProgress(context);

    return `${title}\n\n${reason}\n\n${progress}`;
  }
}

/**
 * 创建消息模板实例
 */
export function createMessageTemplate(): MessageTemplate {
  return new DefaultMessageTemplate();
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
  directory?: string
): Promise<MessageContext> {
  const project = await extractProjectContext(directory || process.cwd());
  const progress = createProgressInfo(eventPayload, directory || process.cwd());

  return {
    project,
    progress,
    eventType,
    eventPayload,
    originalEventType,
  };
}

/**
 * 快速构建消息（简化接口）
 */
export async function buildStructuredMessage(
  eventType: NotificationType,
  eventPayload?: unknown,
  originalEventType?: string,
  directory?: string
): Promise<string> {
  const context = await buildMessageContext(
    eventType,
    eventPayload,
    originalEventType,
    directory
  );

  const template = createMessageTemplate();
  return template.buildFullMessage(context);
}
