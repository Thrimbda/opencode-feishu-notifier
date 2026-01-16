# 本地开发测试指南

## 当前配置状态

✅ OpenCode 已配置为使用本地插件路径：
```
/Users/c1/Work/opencode-feishu-notifier
```

配置文件位置：`~/.config/opencode/opencode.json`

---

## 快速开发流程

### 1. 修改代码
直接编辑插件源代码，例如：
```bash
# 编辑主文件
vim src/index.ts

# 编辑配置逻辑
vim src/config.ts

# 编辑消息模板
vim src/feishu/messages.ts
```

### 2. 类型检查（可选但推荐）
```bash
npm run typecheck
```

### 3. 重启 OpenCode
- 完全退出 OpenCode
- 重新启动 OpenCode
- 插件会自动加载最新代码

### 4. 查看日志
在 OpenCode 中检查以下日志：
- `"Feishu notifier plugin initialized"` - 插件成功加载
- `"Loaded Feishu config"` - 配置加载成功
- `"Event received"` - 收到事件
- `"Feishu notification sent"` - 通知发送成功

---

## 测试已修复的问题

### 验证初始化日志
1. 重启 OpenCode
2. 立即查看日志输出
3. 应该看到：`"Feishu notifier plugin initialized"` (info 级别)

### 验证配置加载
OpenCode 会尝试从以下位置加载配置（按优先级）：
1. 环境变量：`FEISHU_APP_ID`, `FEISHU_APP_SECRET`, `FEISHU_RECEIVER_TYPE`, `FEISHU_RECEIVER_ID`
2. 项目配置：`{project}/.opencode/feishu-notifier.json`
3. 全局配置：`~/.config/opencode/feishu-notifier.json`

### 配置示例
创建 `~/.config/opencode/feishu-notifier.json`：
```json
{
  "appId": "cli_xxxxx",
  "appSecret": "your_app_secret",
  "receiverType": "user_id",
  "receiverId": "your_user_id"
}
```

或使用环境变量：
```bash
export FEISHU_APP_ID="cli_xxxxx"
export FEISHU_APP_SECRET="your_app_secret"
export FEISHU_RECEIVER_TYPE="user_id"
export FEISHU_RECEIVER_ID="your_user_id"
```

---

## 切换回 npm 版本

如果想切换回已发布的 npm 版本：

```bash
# 编辑配置文件
vim ~/.config/opencode/opencode.json

# 将 plugin 数组改为：
{
  "plugin": ["opencode-feishu-notifier"]
}

# 或者指定版本：
{
  "plugin": ["opencode-feishu-notifier@0.2.6"]
}
```

---

## 常见问题

### Q: 修改代码后没有生效？
A: 确保完全重启了 OpenCode。插件只在启动时加载一次。

### Q: 看不到初始化日志？
A: 检查：
1. OpenCode 日志级别设置（需要包含 info 级别）
2. 插件路径是否正确（运行 `cat ~/.config/opencode/opencode.json`）
3. src/index.ts 是否使用了 `export default`

### Q: 如何调试插件？
A: 在代码中使用 `log()` 函数：
```typescript
log("debug", "Debug message", { someData: value })
log("info", "Info message")
log("error", "Error occurred", { error: errorMessage })
```

---

## 当前修复内容

已修复的问题：将具名导出改为默认导出

**修改前：**
```typescript
export const FeishuNotifierPlugin: Plugin = async ({ client, directory }) => {
```

**修改后：**
```typescript
const FeishuNotifierPlugin: Plugin = async ({ client, directory }) => {
  // ...
};

export default FeishuNotifierPlugin;
```

这个修复使得 OpenCode 能够正确识别和加载插件。

---

## 准备发布新版本

当本地测试完成，准备发布时：

1. 更新版本号
```bash
npm version patch  # 0.2.6 -> 0.2.7
# 或
npm version minor  # 0.2.6 -> 0.3.0
```

2. 发布到 npm
```bash
npm publish
```

3. 切换回 npm 版本（可选）
```bash
node setup-local-testing.mjs  # 运行后手动编辑切换回 npm 包名
```
