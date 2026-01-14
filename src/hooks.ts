import type { NotificationType } from "./feishu/messages"

export function mapEventToNotification(eventType: string): NotificationType | null {
  switch (eventType) {
    case "permission.updated":
      return "permission_required"
    case "tui.prompt.append":
      return "interaction_required"
    case "tui.command.execute":
      return "command_args_required"
    case "tui.toast.show":
      return "confirmation_required"
    default:
      return null
  }
}
