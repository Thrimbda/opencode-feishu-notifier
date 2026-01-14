import type { FeishuConfig } from "../config"

type TenantTokenResponse = {
  code: number
  msg: string
  tenant_access_token?: string
}

type MessageResponse = {
  code: number
  msg: string
  data?: {
    message_id?: string
  }
}

function ensureFetch(): typeof fetch {
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is not available. Use Node.js 18+.")
  }

  return fetch
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    throw new Error(`Empty response from Feishu API (${response.status}).`)
  }

  return JSON.parse(text) as T
}

export async function getTenantAccessToken(config: FeishuConfig): Promise<string> {
  const fetchImpl = ensureFetch()
  const response = await fetchImpl(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_id: config.appId,
        app_secret: config.appSecret
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Feishu auth request failed: ${response.status}`)
  }

  const payload = await readJson<TenantTokenResponse>(response)
  if (payload.code !== 0 || !payload.tenant_access_token) {
    throw new Error(`Feishu auth failed: ${payload.msg} (${payload.code})`)
  }

  return payload.tenant_access_token
}

export async function sendTextMessage(
  config: FeishuConfig,
  text: string
): Promise<MessageResponse> {
  const fetchImpl = ensureFetch()
  const token = await getTenantAccessToken(config)
  const response = await fetchImpl(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${config.receiverType}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        receive_id: config.receiverId,
        msg_type: "text",
        content: JSON.stringify({
          text
        })
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Feishu message request failed: ${response.status}`)
  }

  const payload = await readJson<MessageResponse>(response)
  if (payload.code !== 0) {
    throw new Error(`Feishu message failed: ${payload.msg} (${payload.code})`)
  }

  return payload
}
