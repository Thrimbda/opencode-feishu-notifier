import type { Plugin } from "@opencode-ai/plugin"
import { loadConfigWithSource } from "./config"
import { mapEventToNotification } from "./hooks"
import { buildNotification } from "./feishu/messages"
import { sendTextMessage } from "./feishu/client"

const serviceName = "opencode-feishu-notifier"

export const FeishuNotifierPlugin: Plugin = async ({ client, directory }) => {
  const { config, sources } = loadConfigWithSource({ directory })

  const logDebug = async (message: string, extra?: Record<string, unknown>) => {
    await client.app.log({
      body: {
        service: serviceName,
        level: "debug",
        message,
        extra
      }
    })
  }

  await client.app.log({
    body: {
      service: serviceName,
      level: "info",
      message: "Feishu notifier plugin initialized"
    }
  })

  await logDebug("Loaded Feishu config", { sources })

  return {
    event: async ({ event }) => {
      await logDebug("Event received", { eventType: event.type })

      const notificationType = mapEventToNotification(event.type)
      if (!notificationType) {
        await logDebug("Event ignored", { eventType: event.type })
        return
      }

      const { text } = buildNotification(notificationType, event)
      await logDebug("Sending Feishu notification", {
        eventType: event.type,
        notificationType
      })

      try {
        const response = await sendTextMessage(config, text)
        await logDebug("Feishu notification sent", {
          messageId: response.data?.message_id ?? null
        })
      } catch (error) {
        await client.app.log({
          body: {
            service: serviceName,
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
