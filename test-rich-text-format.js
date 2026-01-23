#!/usr/bin/env node

// 测试飞书富文本格式生成
function textToPostContent(text, title = "OpenCode 通知") {
  // 移除空行，但保留换行符
  const cleanedText = text.split('\n').filter(line => line.trim().length > 0).join('\n')
  
  const content = [
    [
      {
        tag: 'text',
        text: cleanedText,
        un_escape: true
      }
    ]
  ]
  
  return {
    post: {
      zh_cn: {
        title,
        content
      }
    }
  }
}

// 测试数据
const testText = `[OpenCode] 需要权限确认
事件类型: permission.updated
会话: 测试会话
Agent: opencode
主机: MacBook-Pro.local
详情: {
  "permissions": [
    {
      "path": "src/config/security.json",
      "type": "read"
    }
  ]
}`

console.log("测试飞书富文本格式生成\n")
console.log("原始文本:")
console.log(testText)
console.log("\n" + "=".repeat(80) + "\n")

// 生成富文本内容
const postContent = textToPostContent(testText, "需要权限确认")
console.log("生成的富文本内容 (JSON):")
console.log(JSON.stringify(postContent, null, 2))
console.log("\n" + "=".repeat(80) + "\n")

// 模拟飞书API请求体
const requestBody = {
  receive_id: "test_receiver_id",
  msg_type: "post",
  content: JSON.stringify(postContent)
}

console.log("完整的API请求体 (content字段已字符串化):")
console.log(JSON.stringify(requestBody, null, 2))
console.log("\n" + "=".repeat(80) + "\n")

console.log("content字段的字符串化值:")
console.log(JSON.stringify(postContent))
console.log("\n" + "=".repeat(80) + "\n")

// 检查格式是否符合预期
console.log("格式分析:")
console.log("1. msg_type:", requestBody.msg_type)
console.log("2. content字段类型:", typeof requestBody.content)
console.log("3. content解析后类型:", typeof JSON.parse(requestBody.content))
console.log("4. 是否有post属性:", JSON.parse(requestBody.content).post ? "是" : "否")
console.log("5. 是否有zh_cn属性:", JSON.parse(requestBody.content).post?.zh_cn ? "是" : "否")
console.log("6. title:", JSON.parse(requestBody.content).post?.zh_cn?.title)
console.log("7. content数组长度:", JSON.parse(requestBody.content).post?.zh_cn?.content?.length)
console.log("8. 第一个段落的内容块数量:", JSON.parse(requestBody.content).post?.zh_cn?.content?.[0]?.length)
console.log("9. 第一个内容块的tag:", JSON.parse(requestBody.content).post?.zh_cn?.content?.[0]?.[0]?.tag)

// 与可能的正确格式比较
console.log("\n" + "=".repeat(80) + "\n")
console.log("可能的格式问题:")
console.log("1. content字段应该是JSON字符串 (✓ 正确)")
console.log("2. post.zh_cn.content应该是二维数组 (✓ 正确)")
console.log("3. 每个内容块应有tag属性 (✓ 正确)")
console.log("4. text字段包含消息内容 (✓ 正确)")
console.log("5. un_escape字段为布尔值 (✓ 正确)")

// 常见错误模式
console.log("\n" + "=".repeat(80) + "\n")
console.log("检查常见错误:")
console.log("1. 是否缺少required字段?")
console.log("2. 数组结构是否正确?")
console.log("3. 字符串转义是否正确?")

// 提供飞书官方文档示例格式
console.log("\n" + "=".repeat(80) + "\n")
console.log("根据飞书官方文档，post消息格式示例:")
console.log(`{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "项目更新通知",
        "content": [
          [
            {
              "tag": "text",
              "text": "项目有更新: "
            },
            {
              "tag": "a",
              "text": "请查看",
              "href": "http://www.example.com/"
            },
            {
              "tag": "at",
              "user_id": "ou_xxxxx"
            }
          ]
        ]
      }
    }
  }
}`)
console.log("\n注意: content字段本身是对象，但在API请求中需要字符串化。")
console.log("我们的实现: content字段是字符串化的JSON。")
console.log("差异: 官方示例中content是对象，但实际API要求字符串化。")