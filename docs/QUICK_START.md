# 快速开始 - 插件已修复并配置完成

## ✅ 当前状态

所有问题已解决，插件已准备好使用！

### 1. 代码修复 ✓
- **问题**: 使用了具名导出 `export const`
- **修复**: 改为默认导出 `export default`
- **文件**: `src/index.ts`

### 2. 本地测试配置 ✓
- **OpenCode 配置**: `~/.config/opencode/opencode.json`
- **插件路径**: `/Users/c1/Work/opencode-feishu-notifier` (本地)
- **模式**: 开发模式（无需发布即可测试）

### 3. 飞书配置 ✓
- **配置文件**: `~/.config/opencode/feishu-notifier.json`
- **App ID**: cli_a9ec****
- **状态**: 配置有效

---

## 🚀 立即测试

### 重启 OpenCode
```bash
# 完全退出 OpenCode
# 重新启动 OpenCode
```

### 预期日志输出

启动后应该看到以下日志：

1. **插件初始化** (修复成功的标志)
   ```
   ℹ️  [INFO] Feishu notifier plugin initialized
   ```

2. **配置加载成功** (配置修复成功的标志)
   ```
   🔍 [DEBUG] Loaded Feishu config
   Extra: {
     "sources": [
       { "type": "file", "detail": "/Users/c1/.config/opencode/feishu-notifier.json" }
     ]
   }
   ```

3. **事件处理** (当有支持的事件触发时)
   ```
   🔍 [DEBUG] Event received
   ℹ️  [INFO] Event mapped to notification
   🔍 [DEBUG] Sending Feishu notification
   🔍 [DEBUG] Feishu notification sent
   ```

---

## 🧪 验证工具

项目中包含多个验证工具：

```bash
# 1. 验证插件结构
node test-plugin.mjs

# 2. 验证配置文件
node verify-config.mjs

# 3. 集成测试
node test-integration.mjs

# 4. TypeScript 类型检查
npm run typecheck
```

---

## 📋 支持的事件类型

插件会监听并响应以下 OpenCode 事件：

| OpenCode 事件 | 通知类型 | 说明 |
|---------------|---------|------|
| `permission.updated` | permission_required | 权限更新 |
| `tui.prompt.append` | interaction_required | 需要交互 |
| `tui.command.execute` | command_args_required | 需要命令参数 |
| `tui.toast.show` | confirmation_required | 需要确认 |

---

## 🔧 继续开发

如果需要修改插件代码：

```bash
# 1. 编辑源代码
vim src/index.ts

# 2. 类型检查
npm run typecheck

# 3. 重启 OpenCode 加载新代码
```

详细开发指南请参考：`LOCAL_DEVELOPMENT.md`

---

## 📝 配置文件格式参考

### OpenCode 插件配置
`~/.config/opencode/opencode.json`:
```json
{
  "plugin": [
    "/Users/c1/Work/opencode-feishu-notifier"
  ],
  "logLevel": "DEBUG"
}
```

### 飞书通知配置
`~/.config/opencode/feishu-notifier.json`:
```json
{
  "appId": "cli_xxxxx",
  "appSecret": "your_app_secret",
  "receiverType": "user_id",
  "receiverId": "your_user_id"
}
```

**注意**: 顶层直接是配置字段，不要嵌套在其他对象中！

---

## ❓ 常见问题

### Q: 看不到初始化日志？
A: 检查：
1. OpenCode 是否完全重启
2. `opencode.json` 中的插件路径是否正确
3. `src/index.ts` 是否使用了 `export default`

### Q: 看到 "Feishu config error"？
A: 运行 `node verify-config.mjs` 检查配置文件格式

### Q: 没有收到飞书通知？
A: 检查：
1. 日志中是否有 "Loaded Feishu config"
2. appId 和 appSecret 是否正确
3. receiverId 是否是您的飞书用户 ID
4. 是否触发了支持的事件类型

---

## 📚 相关文件

- `LOCAL_DEVELOPMENT.md` - 完整开发指南
- `TEST_REPORT.md` - 详细测试报告
- `setup-local-testing.mjs` - 本地测试配置脚本
- `verify-config.mjs` - 配置验证脚本

---

## 🎉 下一步

**现在就重启 OpenCode 测试吧！**

您应该能看到：
1. ✓ 插件初始化日志
2. ✓ 配置加载成功日志
3. ✓ 当有支持的事件时，飞书通知成功发送

祝测试顺利！
