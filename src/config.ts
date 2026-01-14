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

type OpencodeConfig = {
  feishuNotifier?: Partial<FeishuConfig>
}

const receiverTypes: ReceiverType[] = ["user_id", "open_id", "chat_id"]

function getConfigPaths(options: LoadConfigOptions): string[] {
  if (options.configPath) {
    return [options.configPath]
  }

  const configPaths: string[] = []
  const directory = options.directory ?? process.cwd()
  configPaths.push(path.join(directory, "opencode.json"))

  const xdgConfig = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config")
  configPaths.push(path.join(xdgConfig, "opencode", "opencode.json"))

  return configPaths
}

function readConfigFile(filePath: string): OpencodeConfig | null {
  if (!fs.existsSync(filePath)) {
    return null
  }

  const raw = fs.readFileSync(filePath, "utf8").trim()
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as OpencodeConfig
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${String(error)}`)
  }
}

export function loadConfig(options: LoadConfigOptions = {}): FeishuConfig {
  const configPaths = getConfigPaths(options)
  let mergedConfig: Partial<FeishuConfig> = {}
  let sawConfig = false

  for (const configPath of configPaths) {
    const config = readConfigFile(configPath)
    if (config?.feishuNotifier) {
      mergedConfig = {
        ...mergedConfig,
        ...config.feishuNotifier
      }
      sawConfig = true
    }
  }

  if (!sawConfig) {
    throw new Error(
      "Missing feishuNotifier config in opencode.json (global or project)."
    )
  }

  const missing: string[] = []
  if (!mergedConfig.appId) missing.push("feishuNotifier.appId")
  if (!mergedConfig.appSecret) missing.push("feishuNotifier.appSecret")
  if (!mergedConfig.receiverType) missing.push("feishuNotifier.receiverType")
  if (!mergedConfig.receiverId) missing.push("feishuNotifier.receiverId")

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
