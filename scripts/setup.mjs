#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read version from package.json
let pluginName = "opencode-feishu-notifier"
try {
  const packagePath = path.join(__dirname, "..", "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
  if (packageJson.version) {
    pluginName = `${packageJson.name}@${packageJson.version}`
  }
} catch (error) {
  console.warn(`⚠️ Could not read package.json: ${error.message}`)
  console.warn(`⚠️ Using plugin name: ${pluginName}`)
}

const configDir = path.join(
  process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME ?? "", ".config"),
  "opencode"
)
const opencodeConfigFile = path.join(configDir, "opencode.json")
const notifierConfigFile = path.join(configDir, "feishu-notifier.json")

fs.mkdirSync(configDir, { recursive: true })

let config = {}
if (fs.existsSync(opencodeConfigFile)) {
  const raw = fs.readFileSync(opencodeConfigFile, "utf8").trim()
  if (raw) {
    config = JSON.parse(raw)
  }
}

const plugins = Array.isArray(config.plugin) ? config.plugin : []
if (!plugins.includes(pluginName)) {
  plugins.push(pluginName)
}

config.plugin = plugins

fs.writeFileSync(opencodeConfigFile, JSON.stringify(config, null, 2) + "\n")
console.log(`Updated ${opencodeConfigFile} with plugin: ${pluginName}`)

let notifier = {}
if (fs.existsSync(notifierConfigFile)) {
  const raw = fs.readFileSync(notifierConfigFile, "utf8").trim()
  if (raw) {
    notifier = JSON.parse(raw)
  }
}

const resolved = {
  appId: process.env.FEISHU_APP_ID ?? notifier.appId,
  appSecret: process.env.FEISHU_APP_SECRET ?? notifier.appSecret,
  receiverType: process.env.FEISHU_RECEIVER_TYPE ?? notifier.receiverType,
  receiverId: process.env.FEISHU_RECEIVER_ID ?? notifier.receiverId
}

const required = ["appId", "appSecret", "receiverType", "receiverId"]
const missing = required.filter((key) => !resolved[key])

if (missing.length > 0) {
  console.error(
    `Missing Feishu config: ${missing.join(", ")}\.\n` +
      "Set FEISHU_* env vars or create:\n" +
      `${notifierConfigFile}\n` +
      JSON.stringify(
        {
          appId: "YOUR_APP_ID",
          appSecret: "YOUR_APP_SECRET",
          receiverType: "user_id",
          receiverId: "USER_OR_CHAT_ID"
        },
        null,
        2
      )
  )
  process.exit(1)
}

console.log(`Plugin configured in ${opencodeConfigFile}`)
console.log(`Feishu config source: ${notifierConfigFile} or FEISHU_* env vars`)

