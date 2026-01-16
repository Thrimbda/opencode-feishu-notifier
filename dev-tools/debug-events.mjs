#!/usr/bin/env node
/**
 * Debug guide for testing Feishu notifier plugin events
 */

console.log("🐛 Feishu Notifier 事件调试指南\n")

console.log("📝 当前问题分析：")
console.log("  ✓ 插件已成功初始化")
console.log("  ✓ 配置加载成功")
console.log("  ✗ 没有收到任何事件\n")

console.log("🔍 可能的原因：\n")

console.log("1. 插件只监听特定的 4 个事件：")
console.log("   - permission.updated")
console.log("   - tui.prompt.append")
console.log("   - tui.command.execute")
console.log("   - tui.toast.show\n")

console.log("2. OpenCode 可能在发送其他类型的事件\n")

console.log("3. 或者根本没有触发任何事件\n")

console.log("=" .repeat(60))
console.log("\n✅ 已添加调试日志\n")

console.log("修改内容：")
console.log("  文件: src/index.ts")
console.log("  改动: 添加了 info 级别日志记录所有接收到的事件\n")

console.log("现在每次收到事件都会输出：")
console.log(`  ℹ️  [INFO] Event received from OpenCode
  Extra: {
    "eventType": "事件类型",
    "eventData": { 事件完整数据 }
  }\n`)

console.log("=" .repeat(60))
console.log("\n🧪 测试步骤：\n")

console.log("步骤 1: 重启 OpenCode")
console.log("  - 完全退出 OpenCode")
console.log("  - 重新启动\n")

console.log("步骤 2: 在 OpenCode 中执行一些操作")
console.log("  建议尝试：")
console.log("  - 发送一些消息给 Claude")
console.log("  - 执行一些命令")
console.log("  - 使用各种功能（文件操作、搜索等）")
console.log("  - 如果有权限请求，允许或拒绝\n")

console.log("步骤 3: 观察日志输出")
console.log("  如果看到 'Event received from OpenCode'，说明：")
console.log("  ✓ 事件监听工作正常")
console.log("  ✓ 可以看到实际的事件类型")
console.log("  ✓ 可以决定是否需要支持更多事件类型\n")

console.log("  如果没有看到任何事件日志，可能：")
console.log("  ✗ OpenCode 不发送插件事件")
console.log("  ✗ 事件监听器没有正确注册")
console.log("  ✗ 需要特定条件才能触发事件\n")

console.log("=" .repeat(60))
console.log("\n📋 支持的事件类型详解：\n")

const events = [
  {
    type: "permission.updated",
    notification: "permission_required",
    trigger: "当 OpenCode 需要新的权限时（如访问文件、网络等）",
    test: "尝试：让 OpenCode 访问它没有权限的资源"
  },
  {
    type: "tui.prompt.append",
    notification: "interaction_required", 
    trigger: "当需要用户在提示符中追加内容时",
    test: "尝试：使用需要追加输入的交互功能"
  },
  {
    type: "tui.command.execute",
    notification: "command_args_required",
    trigger: "当执行命令需要额外参数时",
    test: "尝试：执行需要参数的命令"
  },
  {
    type: "tui.toast.show",
    notification: "confirmation_required",
    trigger: "当显示需要确认的提示时",
    test: "尝试：执行需要用户确认的操作"
  }
]

events.forEach((e, i) => {
  console.log(`${i + 1}. ${e.type}`)
  console.log(`   → 通知类型: ${e.notification}`)
  console.log(`   → 触发时机: ${e.trigger}`)
  console.log(`   → 测试方法: ${e.test}\n`)
})

console.log("=" .repeat(60))
console.log("\n💡 如果发现其他事件类型：\n")

console.log("1. 记录事件类型名称")
console.log("2. 决定是否需要为这些事件发送飞书通知")
console.log("3. 编辑 src/hooks.ts 添加新的事件映射")
console.log("4. 编辑 src/feishu/messages.ts 添加新的通知消息模板\n")

console.log("示例 - 添加新事件支持：")
console.log(`
// src/hooks.ts
export function mapEventToNotification(eventType: string): NotificationType | null {
  switch (eventType) {
    case "permission.updated":
      return "permission_required"
    // ... 其他已有的事件 ...
    case "new.event.type":  // 新事件类型
      return "new_notification_type"
    default:
      return null
  }
}
`)

console.log("=" .repeat(60))
console.log("\n🚀 下一步：\n")

console.log("1. 重启 OpenCode")
console.log("2. 在 OpenCode 中进行各种操作")
console.log("3. 观察日志中的 'Event received from OpenCode'")
console.log("4. 把看到的事件类型告诉我，我可以帮您添加支持\n")

console.log("准备好了吗？重启 OpenCode 开始测试！")
