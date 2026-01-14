export type ReceiverType = "user_id" | "open_id" | "chat_id"

export interface FeishuConfig {
  appId: string
  appSecret: string
  receiverType: ReceiverType
  receiverId: string
}

const receiverTypes: ReceiverType[] = ["user_id", "open_id", "chat_id"]

const requiredEnv = {
  FEISHU_APP_ID: "appId",
  FEISHU_APP_SECRET: "appSecret",
  FEISHU_RECEIVER_TYPE: "receiverType",
  FEISHU_RECEIVER_ID: "receiverId"
} as const

export function loadConfig(): FeishuConfig {
  const missing: string[] = []
  const values: Record<string, string> = {}

  for (const envKey of Object.keys(requiredEnv)) {
    const value = process.env[envKey]
    if (!value) {
      missing.push(envKey)
    } else {
      values[envKey] = value
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`)
  }

  const receiverType = values.FEISHU_RECEIVER_TYPE as ReceiverType
  if (!receiverTypes.includes(receiverType)) {
    throw new Error(
      `Invalid FEISHU_RECEIVER_TYPE: ${values.FEISHU_RECEIVER_TYPE}. Expected one of ${receiverTypes.join(
        ", "
      )}`
    )
  }

  return {
    appId: values.FEISHU_APP_ID,
    appSecret: values.FEISHU_APP_SECRET,
    receiverType,
    receiverId: values.FEISHU_RECEIVER_ID
  }
}
