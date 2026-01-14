import { loadConfig } from "./config"
import { buildNotification } from "./feishu/messages"
import { sendTextMessage } from "./feishu/client"

async function main(): Promise<void> {
  try {
    const config = loadConfig()
    const { text } = buildNotification("setup_test")
    await sendTextMessage(config, text)
    console.log("Feishu setup successful.")
  } catch (error) {
    console.error(`Feishu setup failed: ${String(error)}`)
    process.exit(1)
  }
}

await main()
