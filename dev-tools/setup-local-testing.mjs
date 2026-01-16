#!/usr/bin/env node
/**
 * Setup script to configure OpenCode to use local plugin for testing
 */

import fs from "node:fs"
import path from "node:path"
import os from "os"

const pluginDir = process.cwd()
const configDir = path.join(
  process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"),
  "opencode"
)
const opencodeConfigFile = path.join(configDir, "opencode.json")

console.log("🔧 Setting up local plugin testing...\n")

// Ensure config directory exists
fs.mkdirSync(configDir, { recursive: true })

// Read existing config
let config = {}
if (fs.existsSync(opencodeConfigFile)) {
  const raw = fs.readFileSync(opencodeConfigFile, "utf8").trim()
  if (raw) {
    try {
      config = JSON.parse(raw)
      console.log(`📄 Found existing config at: ${opencodeConfigFile}`)
    } catch (error) {
      console.error(`⚠️  Warning: Invalid JSON in ${opencodeConfigFile}, creating new config`)
    }
  }
}

// Update plugin array
const plugins = Array.isArray(config.plugin) ? config.plugin : []

// Remove npm package name if exists
const npmPackageName = "opencode-feishu-notifier"
const npmIndex = plugins.indexOf(npmPackageName)
if (npmIndex !== -1) {
  plugins.splice(npmIndex, 1)
  console.log(`🗑️  Removed npm package: ${npmPackageName}`)
}

// Remove old local path if exists
const oldLocalPath = plugins.find(p => typeof p === 'string' && p.includes('opencode-feishu-notifier'))
if (oldLocalPath && oldLocalPath !== pluginDir) {
  const oldIndex = plugins.indexOf(oldLocalPath)
  plugins.splice(oldIndex, 1)
  console.log(`🗑️  Removed old local path: ${oldLocalPath}`)
}

// Add current directory path if not already present
if (!plugins.includes(pluginDir)) {
  plugins.push(pluginDir)
  console.log(`➕ Added local plugin path: ${pluginDir}`)
} else {
  console.log(`✓ Local plugin path already configured: ${pluginDir}`)
}

config.plugin = plugins

// Write updated config
fs.writeFileSync(opencodeConfigFile, JSON.stringify(config, null, 2) + "\n")
console.log(`\n✅ Updated ${opencodeConfigFile}\n`)

// Show current config
console.log("📋 Current plugin configuration:")
config.plugin.forEach((p, i) => {
  const isLocal = p.startsWith('/')
  console.log(`  ${i + 1}. ${p} ${isLocal ? '(local)' : '(npm)'}`)
})

console.log("\n🎯 Next steps:")
console.log("  1. Restart OpenCode to reload the plugin")
console.log("  2. Check logs for: 'Feishu notifier plugin initialized'")
console.log("  3. Make changes to the plugin code")
console.log("  4. Restart OpenCode to test your changes")
console.log("\n💡 Tip: Any code changes will require an OpenCode restart to take effect")
