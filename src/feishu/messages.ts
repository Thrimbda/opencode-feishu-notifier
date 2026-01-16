export type NotificationType =
  | "interaction_required"
  | "permission_required"
  | "command_args_required"
  | "confirmation_required"
  | "session_idle"
  | "question_asked"
  | "setup_test"

type EventPayload = {
  type?: string
  payload?: unknown
}

// 保持向后兼容的标题映射
const titles: Record<NotificationType, string> = {
  interaction_required: "需要交互",
  permission_required: "需要权限确认",
  command_args_required: "需要补充参数",
  confirmation_required: "需要确认",
  session_idle: "OpenCode 闲暇",
  question_asked: "需要选择方案",
  setup_test: "Feishu 通知测试"
}

/**
 * 构建结构化通知消息（新版本）
 * @param type 通知类型
 * @param event 事件数据
 * @param directory 工作目录（可选，默认当前目录）
 * @returns 包含标题和文本的消息对象
 */
export async function buildStructuredNotification(
  type: NotificationType,
  event?: EventPayload,
  directory?: string
): Promise<{ title: string; text: string }> {
  // 导入模板系统
  const { buildStructuredMessage } = await import("./templates")
  
  try {
    const text = await buildStructuredMessage(
      type,
      event?.payload,
      event?.type,
      directory
    )
    
    // 返回标题（保持向后兼容）
    return {
      title: titles[type],
      text
    }
  } catch (error) {
    // 如果模板系统失败，回退到原始实现
    console.warn("Failed to build structured message, falling back:", error)
    return buildLegacyNotification(type, event)
  }
}

/**
 * 构建传统格式的通知消息（向后兼容）
 */
export function buildLegacyNotification(
  type: NotificationType,
  event?: EventPayload
): { title: string; text: string } {
  const title = titles[type]
  if (type === "setup_test") {
    return {
      title,
      text: `${title}\nFeishu 通知已启用。`
    }
  }

  const payloadText = formatPayload(event?.payload)
  const lines = [
    `[OpenCode] ${title}`,
    event?.type ? `事件类型: ${event.type}` : "",
    payloadText ? `详情: ${payloadText}` : ""
  ].filter(Boolean)

  return {
    title,
    text: lines.join("\n")
  }
}

/**
 * 格式化负载文本
 */
function formatPayload(payload: unknown): string {
  if (!payload) {
    return ""
  }

  const text = JSON.stringify(payload, null, 2)
  if (text.length > 1200) {
    return `${text.slice(0, 1200)}…`
  }

  return text
}

/**
 * 构建通知消息（主入口，保持向后兼容）
 * 默认使用结构化消息，失败时回退
 */
export async function buildNotification(
  type: NotificationType,
  event?: EventPayload,
  directory?: string
): Promise<{ title: string; text: string }> {
  // 默认使用结构化消息
  return buildStructuredNotification(type, event, directory)
}
