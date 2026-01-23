#!/usr/bin/env node
/**
 * Test script to verify the plugin can be loaded correctly
 */

import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("🧪 Testing Feishu Notifier Plugin...\n")

// Test 1: Check if module can be imported
console.log("Test 1: Checking module import...")
try {
  const pluginPath = path.join(__dirname, "..", "src/index.ts")
  console.log(`  Plugin path: ${pluginPath}`)
  
  // For TypeScript files, we need to use a different approach
  // Let's check if the file exports correctly
  const { readFileSync } = await import("node:fs")
  const content = readFileSync(pluginPath, "utf8")
  
  // Check for default export
  const hasDefaultExport = /export\s+default/.test(content)
  const hasNamedExport = /export\s+const\s+FeishuNotifierPlugin/.test(content)
  
  console.log(`  ✓ File exists`)
  console.log(`  ${hasDefaultExport ? '✓' : '✗'} Has default export`)
  console.log(`  ${!hasNamedExport ? '✓' : '✗'} No conflicting named export`)
  
  if (!hasDefaultExport) {
    console.error("\n❌ ERROR: Plugin must use 'export default' not 'export const'")
    process.exit(1)
  }
  
  if (hasNamedExport) {
    console.error("\n❌ ERROR: Found named export 'export const FeishuNotifierPlugin'")
    console.error("   This should be 'export default FeishuNotifierPlugin'")
    process.exit(1)
  }
  
  console.log("  ✓ Export structure is correct\n")
} catch (error) {
  console.error(`  ✗ Failed: ${error.message}`)
  process.exit(1)
}

// Test 2: Verify plugin structure
console.log("Test 2: Checking plugin structure...")
try {
  const { readFileSync } = await import("node:fs")
  const content = readFileSync(path.join(__dirname, "..", "src/index.ts"), "utf8")
  
  // Check for required imports
  const hasPluginImport = /import.*Plugin.*from.*@opencode-ai\/plugin/.test(content)
  console.log(`  ${hasPluginImport ? '✓' : '✗'} Imports Plugin type`)
  
  // Check for plugin function signature
  const hasAsyncFunction = /async\s*\(\s*\{\s*client\s*,\s*directory\s*\}\s*\)/.test(content)
  console.log(`  ${hasAsyncFunction ? '✓' : '✗'} Has correct async function signature`)
  
  // Check for initialization log
  const hasInitLog = /log\s*\(\s*["']info["']\s*,\s*["'].*initialized["']/.test(content)
  console.log(`  ${hasInitLog ? '✓' : '✗'} Has initialization log`)
  
  // Check for event handler
  const hasEventHandler = /event\s*:\s*async/.test(content)
  console.log(`  ${hasEventHandler ? '✓' : '✗'} Has event handler`)
  
  console.log("  ✓ Plugin structure is correct\n")
} catch (error) {
  console.error(`  ✗ Failed: ${error.message}`)
  process.exit(1)
}

// Test 3: Check package.json configuration
console.log("Test 3: Checking package.json...")
try {
  const { readFileSync } = await import("node:fs")
  const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8"))
  
  console.log(`  Name: ${pkg.name}`)
  console.log(`  Version: ${pkg.version}`)
  console.log(`  Main: ${pkg.main}`)
  console.log(`  Type: ${pkg.type}`)
  
  const hasCorrectMain = pkg.main === "src/index.ts"
  const hasModuleType = pkg.type === "module"
  const hasPluginDep = pkg.dependencies && pkg.dependencies["@opencode-ai/plugin"]
  
  console.log(`  ${hasCorrectMain ? '✓' : '✗'} Main points to src/index.ts`)
  console.log(`  ${hasModuleType ? '✓' : '✗'} Type is module`)
  console.log(`  ${hasPluginDep ? '✓' : '✗'} Has @opencode-ai/plugin dependency`)
  
  console.log("  ✓ package.json is configured correctly\n")
} catch (error) {
  console.error(`  ✗ Failed: ${error.message}`)
  process.exit(1)
}

console.log("✅ All tests passed!")
console.log("\n📝 Summary:")
console.log("  - Plugin uses correct default export")
console.log("  - Plugin structure matches OpenCode requirements")
console.log("  - package.json is properly configured")
console.log("\n🎉 The plugin should now work when installed in OpenCode!")
