# 新增事件支持总结

## ✅ 已添加的事件类型

根据您的需求，插件现在支持以下新事件：

### 1. OpenCode 闲暇 (`session.idle`)
- **事件类型**: `session.status` (当 status.type 为 "idle")
- **触发时机**: 当 OpenCode 完成所有任务，进入空闲状态
- **通知标题**: "OpenCode 闲暇"
- **使用场景**: 提醒您 OpenCode 已完成工作，可以查看结果

### 2. 需要选择方案 (`question.asked`)
- **事件类型**: `question.asked`
- **触发时机**: 当 OpenCode 询问您选择方案或选项时
- **通知标题**: "需要选择方案"
- **使用场景**: 当 OpenCode 需要您做决策时及时通知

### 3. 需要权限确认 (`permission.asked` / `permission.updated`)
- **事件类型**: `permission.asked` (当请求权限时) 或 `permission.updated` (当权限更新时)
- **触发时机**: 当 OpenCode 请求新权限时
- **通知标题**: "需要权限确认"
- **使用场景**: 权限请求需要您确认（例如：读取 .env 文件、访问外部目录）

## 📋 完整支持的事件列表

现在插件支持以下所有事件：

| 事件类型 | 通知标题 | 说明 |
|---------|---------|------|
| `session.status` (idle) | OpenCode 闲暇 | OpenCode 完成工作进入闲暇状态 |
| `question.asked` | 需要选择方案 | 需要您选择方案或选项 |
| `permission.asked` | 需要权限确认 | 请求新权限时（如读取 .env 文件） |
| `permission.updated` | 需要权限确认 | 权限更新时 |
| `tui.prompt.append` | 需要交互 | 需要在提示符追加内容 |
| `tui.command.execute` | 需要补充参数 | 命令执行需要额外参数 |
| `tui.toast.show` | 需要确认 | 显示需要确认的提示 |

## 🔧 实现细节

### 代码修改

**1. src/feishu/messages.ts**
```typescript
export type NotificationType =
  | "interaction_required"
  | "permission_required"
  | "command_args_required"
  | "confirmation_required"
  | "session_idle"        // 新增
  | "question_asked"      // 新增
  | "setup_test"

const titles: Record<NotificationType, string> = {
  // ... 其他
  session_idle: "OpenCode 闲暇",      // 新增
  question_asked: "需要选择方案",     // 新增
}
```

**2. src/hooks.ts**
```typescript
export function mapEventToNotification(eventType: string): NotificationType | null {
  switch (eventType) {
    case "permission.asked":       // 新增
      return "permission_required"
    case "permission.updated":     // 已有
      return "permission_required"
    case "question.asked":         // 新增
      return "question_asked"
    // ... 其他事件
    default:
      return null
  }
}
```

**3. src/index.ts**
```typescript
event: async ({ event }) => {
  logDebug("Event received", { eventType: event.type });

  let notificationType = mapEventToNotification(event.type);
  
  // 特殊处理: session.status 的 idle 状态
  if (event.type === "session.status" && event.properties?.status?.type === "idle") {
    notificationType = "session_idle";
  }
  
  // ... 后续处理
}
```

## 🧪 测试方法

重启 OpenCode 后，您可以通过以下方式测试新事件：

### 测试闲暇通知
1. 向 OpenCode 发送一个任务
2. 等待 OpenCode 完成任务
3. 当状态变为闲暇时，应收到飞书通知

### 测试选择方案通知
1. 让 OpenCode 执行需要选择的任务
2. 例如：问 OpenCode "我应该用 React 还是 Vue？"
3. 当 OpenCode 询问时，应收到飞书通知

### 测试权限请求通知
1. 让 OpenCode 访问需要权限的资源
2. 例如：读取 test.env 文件或其他 .env 文件
3. 当权限请求弹出时，应立即收到飞书通知
4. 无论您是批准还是拒绝，都会收到通知

## 📝 通知消息格式

所有通知都包含以下信息：
```
[OpenCode] {通知标题}
事件类型: {event.type}
详情: {事件数据（如果有）}
```

例如闲暇通知：
```
[OpenCode] OpenCode 闲暇
事件类型: session.status
详情: {
  "sessionID": "ses_xxx",
  "status": {
    "type": "idle"
  }
}
```

## 🚀 下一步

1. **重启 OpenCode** 加载新代码
2. **正常使用** OpenCode，观察通知
3. **调整配置**（如果需要）：
   - 如果觉得闲暇通知太频繁，可以注释掉相关代码
   - 如果需要添加更多事件类型，参考实现方式

## 💡 提示

- 闲暇通知会在每次 OpenCode 完成任务后发送
- 如果觉得通知太频繁，可以选择性禁用某些事件
- 所有通知都会记录在 OpenCode 日志中（DEBUG 级别）
