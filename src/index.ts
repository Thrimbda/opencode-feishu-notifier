import type { Plugin } from "@opencode-ai/plugin";
import { loadConfigWithSource } from "./config";
import { sendTextMessage } from "./feishu/client";
import { buildNotification } from "./feishu/messages";
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

  const logError = (message: string, extra?: Record<string, unknown>) => {
    log("error", message, extra);
  };

  const ensureConfig = () => {
    if (configCache || configError) {
      return;
    }

    try {
      configCache = loadConfigWithSource({ directory });
      logDebug("Loaded Feishu config", { sources: configCache.sources });
    } catch (error) {
      configError = error instanceof Error ? error : new Error(String(error));
      logError("Feishu config error", { error: configError.message });
    }
  };

  log("info", "Feishu notifier plugin initialized");
  ensureConfig();

  return {
    event: async ({ event }) => {
      logDebug("Event received", { eventType: event.type });

      // Check for session.status with idle state
      let notificationType = mapEventToNotification(event.type);

      // Special handling for session.status events
      if (
        event.type === "session.status" &&
        event.properties?.status?.type === "idle"
      ) {
        notificationType = "session_idle";
      }

      if (!notificationType) {
        logDebug("Event ignored", { eventType: event.type });
        return;
      }
      log("info", "Event mapped to notification", {
        eventType: event.type,
        notificationType,
      });

      ensureConfig();
      if (!configCache) {
        return;
      }

      const { text } = await buildNotification(
        notificationType,
        event,
        directory
      );
      logDebug("Sending Feishu notification", {
        eventType: event.type,
        notificationType,
        directory,
      });

      try {
        const response = await sendTextMessage(configCache.config, text);
        logDebug("Feishu notification sent", {
          messageId: response.data?.message_id ?? null,
        });
      } catch (error) {
        logError("Failed to send Feishu notification", {
          error: String(error),
        });
      }
    },
  };
};

export default FeishuNotifierPlugin;
