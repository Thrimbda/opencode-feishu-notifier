import os from "os";

export type FeishuPostContent = {
  post: {
    zh_cn: {
      title: string
      content: Array<Array<{
        tag: string
        text?: string
        href?: string
        un_escape?: boolean
      }>>
    }
  }
}

export type NotificationResult = {
  title: string
  text: string
  richContent?: FeishuPostContent
}

export type NotificationType =
  | "interaction_required"
  | "permission_required"
  | "command_args_required"
  | "confirmation_required"
  | "session_idle"
  | "question_asked"
  | "setup_test"

type EventPayload = {
  type?: string;
  payload?: unknown;
  properties?: Record<string, unknown>;
}

type SessionContext = {
  sessionID?: string;
  parentID?: string;
  sessionTitle?: string;
  agentName?: string;
};

type SessionClient = {
  session?: {
    get?: (options: { path: { id: string } }) => Promise<{
      data?: {
        parentID?: string;
        title?: string;
      };
    }>;
  };
};

type SessionMetadata = {
  loaded?: boolean;
  parentID?: string;
  sessionTitle?: string;
  agentName?: string;
};

const sessionMetadataCache = new Map<string, SessionMetadata>();

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readSessionMetadataCache(sessionID: string): SessionMetadata {
  return sessionMetadataCache.get(sessionID) ?? {};
}

function writeSessionMetadataCache(sessionID: string, metadata: SessionMetadata): void {
  const cached = readSessionMetadataCache(sessionID);
  const nextMetadata: SessionMetadata = { ...cached };

  if (metadata.loaded !== undefined) {
    nextMetadata.loaded = metadata.loaded;
  }

  if (metadata.parentID !== undefined) {
    nextMetadata.parentID = metadata.parentID;
  }

  if (metadata.sessionTitle !== undefined) {
    nextMetadata.sessionTitle = metadata.sessionTitle;
  }

  if (metadata.agentName !== undefined) {
    nextMetadata.agentName = metadata.agentName;
  }

  sessionMetadataCache.set(sessionID, nextMetadata);
}

function extractEventPayload(event?: EventPayload): unknown {
  if (!event) {
    return undefined;
  }
  if (event.payload !== undefined) {
    return event.payload;
  }
  if (event.properties !== undefined) {
    return event.properties;
  }
  return undefined;
}

function extractEventProperties(event?: EventPayload): Record<string, unknown> | undefined {
  if (!event) {
    return undefined;
  }
  if (event.properties) {
    return asRecord(event.properties);
  }
  if (event.payload) {
    return asRecord(event.payload);
  }
  return undefined;
}

function extractSessionContext(event?: EventPayload): SessionContext {
  const properties = extractEventProperties(event);
  const info = asRecord(properties?.info);
  const part = asRecord(properties?.part);

  const sessionID =
    readString(properties?.sessionID) ??
    readString(info?.sessionID) ??
    readString(info?.id) ??
    readString(part?.sessionID);

  const parentID =
    readString(properties?.parentID) ??
    readString(properties?.parentId) ??
    readString(info?.parentID) ??
    readString(info?.parentId) ??
    readString(info?.parentSessionID) ??
    readString(part?.parentID) ??
    readString(part?.parentId);

  const sessionTitle = readString(info?.title);

  const agentName =
    readString(properties?.agent) ??
    readString(info?.agent) ??
    readString(part?.agent) ??
    readString(part?.name);

  return {
    sessionID,
    parentID,
    sessionTitle,
    agentName,
  };
}

async function resolveSessionContext(
  event?: EventPayload,
  client?: SessionClient
): Promise<SessionContext> {
  const baseContext = extractSessionContext(event);
  if (!baseContext.sessionID) {
    return baseContext;
  }

  const cachedMetadata = readSessionMetadataCache(baseContext.sessionID);
  const mergedContext = {
    ...baseContext,
    parentID: baseContext.parentID ?? cachedMetadata.parentID,
    sessionTitle: baseContext.sessionTitle ?? cachedMetadata.sessionTitle,
    agentName: baseContext.agentName ?? cachedMetadata.agentName,
  };

  if (mergedContext.sessionTitle && (mergedContext.parentID || cachedMetadata.loaded)) {
    return mergedContext;
  }

  if (client?.session?.get) {
    try {
      const response = await client.session.get({
        path: { id: baseContext.sessionID },
      });
      const title = response?.data?.title;
      const parentID = response?.data?.parentID;

      writeSessionMetadataCache(baseContext.sessionID, {
        loaded: true,
        sessionTitle: title,
        parentID,
      });

      return {
        ...mergedContext,
        parentID: parentID ?? mergedContext.parentID,
        sessionTitle: title ?? mergedContext.sessionTitle,
      };
    } catch {
      // 忽略会话信息获取失败
    }
  }

  return mergedContext;
}

export function recordEventContext(event?: EventPayload): void {
  const context = extractSessionContext(event);
  if (!context.sessionID) {
    return;
  }

  if (
    context.parentID === undefined &&
    context.sessionTitle === undefined &&
    context.agentName === undefined
  ) {
    return;
  }

  writeSessionMetadataCache(context.sessionID, {
    parentID: context.parentID,
    sessionTitle: context.sessionTitle,
    agentName: context.agentName,
  });
}

export async function isSubagentSession(
  event?: EventPayload,
  client?: SessionClient
): Promise<boolean> {
  const baseContext = extractSessionContext(event);
  if (!baseContext.sessionID) {
    return Boolean(baseContext.parentID);
  }

  if (client?.session?.get) {
    try {
      const response = await client.session.get({
        path: { id: baseContext.sessionID },
      });
      const title = response?.data?.title;
      const parentID = response?.data?.parentID;

      writeSessionMetadataCache(baseContext.sessionID, {
        loaded: true,
        sessionTitle: title,
        parentID,
      });

      return Boolean(parentID);
    } catch {
      // 忽略会话信息获取失败，回退到事件字段和缓存
    }
  }

  if (baseContext.parentID) {
    return true;
  }

  const cachedMetadata = readSessionMetadataCache(baseContext.sessionID);
  return Boolean(cachedMetadata.parentID);
}

export async function shouldSendSessionIdleNotification(
  event?: EventPayload,
  client?: SessionClient
): Promise<boolean> {
  return !(await isSubagentSession(event, client));
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
  directory?: string,
  client?: SessionClient
): Promise<NotificationResult> {
  // 导入模板系统
  const { buildStructuredMessage } = await import("./templates")

  const eventPayload = extractEventPayload(event);
  const sessionContext = await resolveSessionContext(event, client);
  
  try {
    const text = await buildStructuredMessage(
      type,
      eventPayload,
      event?.type,
      directory,
      sessionContext
    )
    
    // 返回标题（保持向后兼容）
    return {
      title: titles[type],
      text,
      richContent: textToPostContent(text, titles[type])
    }
  } catch (error) {
    // 如果模板系统失败，回退到原始实现
    return buildLegacyNotification(type, event)
  }
}

/**
 * 构建传统格式的通知消息（向后兼容）
 */
export function buildLegacyNotification(
  type: NotificationType,
  event?: EventPayload
): NotificationResult {
  const title = titles[type]
  if (type === "setup_test") {
    const text = `${title}\nFeishu 通知已启用。`
    return {
      title,
      text,
      richContent: textToPostContent(text, title)
    }
  }

  const payloadText = formatPayload(extractEventPayload(event))
  const sessionContext = extractSessionContext(event)
  const lines = [
    `[OpenCode] ${title}`,
    event?.type ? `事件类型: ${event.type}` : "",
    sessionContext.sessionTitle || sessionContext.sessionID
      ? `会话: ${sessionContext.sessionTitle ?? sessionContext.sessionID}`
      : "",
    sessionContext.agentName ? `Agent: ${sessionContext.agentName}` : "",
    `主机: ${os.hostname()}`,
    payloadText ? `详情: ${payloadText}` : ""
  ].filter(Boolean)

  const text = lines.join("\n")
  return {
    title,
    text,
    richContent: textToPostContent(text, title)
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
 * 将纯文本转换为飞书富文本（post）格式
 * 简化实现：所有文本作为一个段落
 */
function textToPostContent(text: string, title: string = "OpenCode 通知"): FeishuPostContent {
  // 移除空行，但保留换行符
  const cleanedText = text.split('\n').filter(line => line.trim().length > 0).join('\n')
  
  const content = [
    [
      {
        tag: 'text',
        text: cleanedText,
        un_escape: true
      }
    ]
  ]
  
  return {
    post: {
      zh_cn: {
        title,
        content
      }
    }
  }
}

/**
 * 构建通知消息（主入口，保持向后兼容）
 * 默认使用结构化消息，失败时回退
 */
export async function buildNotification(
  type: NotificationType,
  event?: EventPayload,
  directory?: string,
  client?: SessionClient
): Promise<NotificationResult> {
  // 默认使用结构化消息
  return buildStructuredNotification(type, event, directory, client)
}
