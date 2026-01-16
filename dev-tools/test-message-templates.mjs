#!/usr/bin/env node

import { buildStructuredMessage } from "../src/feishu/templates.ts"

// 测试各种事件类型的消息生成
const testCases = [
  {
    type: "session_idle",
    payload: {
      message: "已完成代码审查和测试",
      task: "重构消息系统"
    },
    description: "会话闲置测试"
  },
  {
    type: "permission_required",
    payload: {
      permissions: [
        { path: "src/config/security.json", type: "read" },
        { path: "src/auth/jwt.service.ts", type: "write" }
      ]
    },
    description: "需要权限测试"
  },
  {
    type: "question_asked",
    payload: {
      options: [
        { label: "使用 Redux Toolkit", description: "完整的 Redux 解决方案" },
        { label: "使用 Zustand", description: "轻量状态管理" },
        { label: "使用 React Context", description: "原生 React 方案" }
      ]
    },
    description: "需要选择方案测试"
  },
  {
    type: "interaction_required",
    payload: {
      prompt: "请提供 CSV 文件的字段分隔符",
      hint: "默认为逗号"
    },
    description: "需要交互输入测试"
  },
  {
    type: "command_args_required",
    payload: {
      args: ["environment", "version"],
      command: "deploy"
    },
    description: "命令参数缺失测试"
  },
  {
    type: "confirmation_required",
    payload: {
      action: "删除 12 个已废弃的数据库迁移文件",
      warning: "此操作不可逆"
    },
    description: "需要确认测试"
  },
  {
    type: "setup_test",
    payload: {},
    description: "测试通知"
  }
]

async function runTests() {
  console.log("🚀 开始测试飞书智能消息引擎\n")
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.description}`)
    console.log(`事件类型: ${testCase.type}`)
    
    try {
      const message = await buildStructuredMessage(
        testCase.type,
        testCase.payload,
        `test.${testCase.type}`,
        process.cwd()
      )
      
      console.log("\n📨 生成的消息:")
      console.log("-".repeat(50))
      console.log(message)
      console.log("-".repeat(50))
      console.log(`✓ 测试通过 (${message.length} 字符)\n`)
    } catch (error) {
      console.error(`✗ 测试失败: ${error.message}\n`)
      console.error(error.stack)
    }
  }
  
  console.log("✅ 所有测试完成")
}

// 运行测试
runTests().catch(error => {
  console.error("测试运行失败:", error)
  process.exit(1)
})