import type { Plugin } from "@opencode-ai/plugin";
import { loadConfigWithSource } from "./config";
import { sendTextMessage, sendRichTextMessage } from "./feishu/client";
import {
  buildNotification,
  recordEventContext,
  shouldSendSessionIdleNotification,
} from "./feishu/messages";
import { mapEventToNotification } from "./hooks";

const serviceName = "opencode-feishu-notifier";

const FeishuNotifierPlugin: Plugin = async ({ client, directory }) => {
  let configCache: ReturnType<typeof loadConfigWithSource> | null = null;
  let configError: Error | null = null;

  const log = (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    extra?: Record<string, unknown>
  ) => {
    const payload = {
      body: {
        service: serviceName,
        level,
        message,
        extra,
      },
    };
    void client.app.log(payload).catch(() => undefined);
  };

  const logDebug = (message: string, extra?: Record<string, unknown>) => {
    log("debug", message, extra);
  };

  const logInfo = (message: string, extra?: Record<string, unknown>) => {
    log("info", message, extra);
  };

  const logError = (message: string, extra?: Record<string, unknown>) => {
    log("error", message, extra);
  };

  logInfo("Feishu notifier plugin loading", { directory });

  const ensureConfig = () => {
    if (configCache || configError) {
      return;
    }

    try {
      configCache = loadConfigWithSource({ directory });
      logInfo("Feishu notifier plugin initialized", { sources: configCache.sources.map(s => s.type) });
      logDebug("Loaded Feishu config", { sources: configCache.sources });
    } catch (error) {
      configError = error instanceof Error ? error : new Error(String(error));
      logError("Feishu config error", { error: configError.message });
    }
  };

  ensureConfig();

  return {
    event: async ({ event }) => {
      recordEventContext(event);
      logDebug("Event received", { eventType: event.type });

      // Check for session.status with idle state
      let notificationType = mapEventToNotification(event.type);

      // Special handling for session.status events
      if (
        event.type === "session.status" &&
        event.properties?.status?.type === "idle"
      ) {
        const shouldSendIdle = await shouldSendSessionIdleNotification(event, {
          session: client.session,
        });

        if (!shouldSendIdle) {
          logDebug("Idle notification skipped for child session", {
            eventType: event.type,
          });
          return;
        }

        notificationType = "session_idle";
      }

      if (!notificationType) {
        logDebug("Event ignored", { eventType: event.type });
        return;
      }
      logDebug("Event mapped to notification", {
        eventType: event.type,
        notificationType,
      });

      ensureConfig();
      if (configError) {
        logError("Feishu config error (cached)", { error: configError.message });
        return;
      }
      if (!configCache) {
        logError("Feishu config not loaded");
        return;
      }

      const { text, title, richContent } = await buildNotification(
        notificationType,
        event,
        directory,
        { session: client.session }
      );
       logDebug("Sending Feishu notification", {
        eventType: event.type,
        notificationType,
        directory,
        hasRichContent: !!richContent,
      });

      try {
        let response;
        if (richContent) {
          // 尝试发送富文本消息
          try {
            logDebug("Attempting to send rich text message", {
              richContentType: typeof richContent,
              hasPost: !!richContent.post,
              hasZhCn: !!(richContent.post?.zh_cn),
              titleLength: richContent.post?.zh_cn?.title?.length ?? 0,
              contentLength: richContent.post?.zh_cn?.content?.length ?? 0,
            });
            response = await sendRichTextMessage(configCache.config, text, title, richContent);
            logDebug("Feishu rich notification sent", {
              messageId: response.data?.message_id ?? null,
            });
           } catch (richError) {
             // 富文本消息失败，回退到纯文本
             logDebug("Rich text message failed, falling back to text", {
               error: richError instanceof Error ? richError.message : String(richError),
               stack: richError instanceof Error ? richError.stack : undefined,
               name: richError instanceof Error ? richError.name : undefined,
             });
            response = await sendTextMessage(configCache.config, text);
            logDebug("Feishu text notification sent (fallback)", {
              messageId: response.data?.message_id ?? null,
            });
          }
        } else {
          // 回退到纯文本
          response = await sendTextMessage(configCache.config, text);
          logDebug("Feishu text notification sent", {
            messageId: response.data?.message_id ?? null,
          });
        }
      } catch (error) {
        logError("Failed to send Feishu notification", {
          error: String(error),
        });
      }
    },
  };
};

export default FeishuNotifierPlugin;
