#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const pluginName = "opencode-feishu-notifier"
const configDir = path.join(
  process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME ?? "", ".config"),
  "opencode"
)
const configFile = path.join(configDir, "opencode.json")

fs.mkdirSync(configDir, { recursive: true })

let config = {}
if (fs.existsSync(configFile)) {
  const raw = fs.readFileSync(configFile, "utf8").trim()
  if (raw) {
    config = JSON.parse(raw)
  }
}

const plugins = Array.isArray(config.plugin) ? config.plugin : []
if (!plugins.includes(pluginName)) {
  plugins.push(pluginName)
}

config.plugin = plugins

const notifier = config.feishuNotifier || {}
const required = ["appId", "appSecret", "receiverType", "receiverId"]
const missing = required.filter((key) => !notifier[key])

fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + "\n")
console.log(`Updated ${configFile} with plugin: ${pluginName}`)

if (missing.length > 0) {
  console.error(
    `Missing feishuNotifier fields: ${missing.join(", ")}.\n` +
      "Add to opencode.json, e.g.:\n" +
      JSON.stringify(
        {
          feishuNotifier: {
            appId: "YOUR_APP_ID",
            appSecret: "YOUR_APP_SECRET",
            receiverType: "user_id",
            receiverId: "USER_OR_CHAT_ID"
          }
        },
        null,
        2
      )
  )
  process.exit(1)
}

execFileSync("npx", ["--yes", "opencode-feishu-setup"], { stdio: "inherit" })
console.log(`Plugin configured in ${configFile}`)
