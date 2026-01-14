import type { Plugin } from "@opencode-ai/plugin"
import { loadConfig } from "./config"
import { mapEventToNotification } from "./hooks"
import { buildNotification } from "./feishu/messages"
import { sendTextMessage } from "./feishu/client"

export const FeishuNotifierPlugin: Plugin = async ({ client }) => {
  const config = loadConfig()

  await client.app.log({
    body: {
      service: "opencode-feishu-notifier",
      level: "info",
      message: "Feishu notifier plugin initialized"
    }
  })

  return {
    event: async ({ event }) => {
      const notificationType = mapEventToNotification(event.type)
      if (!notificationType) {
        return
      }

      const { text } = buildNotification(notificationType, event)
      try {
        await sendTextMessage(config, text)
      } catch (error) {
        await client.app.log({
          body: {
            service: "opencode-feishu-notifier",
            level: "error",
            message: "Failed to send Feishu notification",
            extra: {
              error: String(error)
            }
          }
        })
        throw error
      }
    }
  }
}
