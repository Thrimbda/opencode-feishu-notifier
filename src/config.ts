import fs from "fs"
import os from "os"
import path from "path"

export type ReceiverType = "user_id" | "open_id" | "chat_id"

export interface FeishuConfig {
  appId: string
  appSecret: string
  receiverType: ReceiverType
  receiverId: string
}

export interface LoadConfigOptions {
  directory?: string
  configPath?: string
}

export type ConfigSource =
  | { type: "file"; detail: string }
  | { type: "env"; detail: string }

const receiverTypes: ReceiverType[] = ["user_id", "open_id", "chat_id"]

function getConfigPaths(options: LoadConfigOptions): string[] {
  if (options.configPath) {
    return [options.configPath]
  }

  const paths: string[] = []
  const directory = options.directory ?? process.cwd()
  const xdgConfig = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config")

  paths.push(path.join(xdgConfig, "opencode", "feishu-notifier.json"))
  paths.push(path.join(directory, ".opencode", "feishu-notifier.json"))

  return paths
}

function readConfigFile(filePath: string): Partial<FeishuConfig> | null {
  if (!fs.existsSync(filePath)) {
    return null
  }

  const raw = fs.readFileSync(filePath, "utf8").trim()
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as Partial<FeishuConfig>
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${String(error)}`)
  }
}

function readEnvConfig(): Partial<FeishuConfig> {
  return {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    receiverType: process.env.FEISHU_RECEIVER_TYPE as ReceiverType | undefined,
    receiverId: process.env.FEISHU_RECEIVER_ID
  }
}

function resolveConfig(options: LoadConfigOptions): {
  mergedConfig: Partial<FeishuConfig>
  sources: ConfigSource[]
} {
  const configPaths = getConfigPaths(options)
  let mergedConfig: Partial<FeishuConfig> = {}
  const sources: ConfigSource[] = []

  for (const configPath of configPaths) {
    const config = readConfigFile(configPath)
    if (config) {
      mergedConfig = {
        ...mergedConfig,
        ...config
      }
      sources.push({ type: "file", detail: configPath })
    }
  }

  const envConfig = readEnvConfig()
  if (envConfig.appId || envConfig.appSecret || envConfig.receiverType || envConfig.receiverId) {
    mergedConfig = {
      ...mergedConfig,
      ...envConfig
    }
    sources.push({ type: "env", detail: "FEISHU_*" })
  }

  return { mergedConfig, sources }
}

function finalizeConfig(mergedConfig: Partial<FeishuConfig>, sources: ConfigSource[]): FeishuConfig {
  if (sources.length === 0) {
    throw new Error(
      "Missing Feishu configuration. Use FEISHU_* environment variables or create feishu-notifier.json."
    )
  }

  const missing: string[] = []
  if (!mergedConfig.appId) missing.push("appId")
  if (!mergedConfig.appSecret) missing.push("appSecret")
  if (!mergedConfig.receiverType) missing.push("receiverType")
  if (!mergedConfig.receiverId) missing.push("receiverId")

  if (missing.length > 0) {
    throw new Error(`Missing config fields: ${missing.join(", ")}`)
  }

  const receiverType = mergedConfig.receiverType as ReceiverType
  if (!receiverTypes.includes(receiverType)) {
    throw new Error(
      `Invalid receiverType: ${mergedConfig.receiverType}. Expected one of ${receiverTypes.join(", ")}`
    )
  }

  return {
    appId: mergedConfig.appId!,
    appSecret: mergedConfig.appSecret!,
    receiverType,
    receiverId: mergedConfig.receiverId!
  }
}

export function loadConfig(options: LoadConfigOptions = {}): FeishuConfig {
  return loadConfigWithSource(options).config
}

export function loadConfigWithSource(
  options: LoadConfigOptions = {}
): { config: FeishuConfig; sources: ConfigSource[] } {
  const { mergedConfig, sources } = resolveConfig(options)
  return {
    config: finalizeConfig(mergedConfig, sources),
    sources
  }
}
