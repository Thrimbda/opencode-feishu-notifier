export type NotificationType =
  | "interaction_required"
  | "permission_required"
  | "command_args_required"
  | "confirmation_required"
  | "setup_test"

type EventPayload = {
  type?: string
  payload?: unknown
}

const titles: Record<NotificationType, string> = {
  interaction_required: "需要交互",
  permission_required: "需要权限确认",
  command_args_required: "需要补充参数",
  confirmation_required: "需要确认",
  setup_test: "Feishu 通知测试"
}

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

export function buildNotification(
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
