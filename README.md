# OpenCode Feishu Notifier

OpenCode 飞书通知插件 - 在关键事件发生时向飞书发送通知

## 快速开始

请查看 [docs/QUICK_START.md](docs/QUICK_START.md) 获取快速开始指南。

## 功能特性

- 🔔 支持多种 OpenCode 事件通知
- 🎯 智能事件过滤，避免通知轰炸
- 🛠️ 本地开发调试工具
- 📝 完整的开发文档

## 支持的事件

- **会话闲置** (`session.status` with `idle`) - OpenCode 等待用户输入
- **权限请求** (`permission.asked`) - 需要用户授权文件访问
- **用户选择** (`question.asked`) - 需要用户选择方案
- **交互式输入** (`tui.prompt.append`) - 需要用户输入
- **命令参数** (`tui.command.execute`) - 需要提供命令参数
- **确认提示** (`tui.toast.show`) - 需要用户确认

详细事件说明请查看 [docs/NEW_EVENTS.md](docs/NEW_EVENTS.md)

## 配置

### 1. 飞书应用配置

在 `~/.config/opencode/feishu-notifier.json` 中配置：

```json
{
  "appId": "your_app_id",
  "appSecret": "your_app_secret",
  "receiverType": "user_id",
  "receiverId": "your_user_id"
}
```

### 2. OpenCode 插件配置

在 `~/.config/opencode/opencode.json` 中启用插件：

```json
{
  "plugin": ["opencode-feishu-notifier@0.2.6"]
}
```

## 文档

- [📚 快速开始指南](docs/QUICK_START.md)
- [🛠️ 本地开发指南](docs/LOCAL_DEVELOPMENT.md)
- [📝 新增事件说明](docs/NEW_EVENTS.md)
- [✅ 测试报告](docs/TEST_REPORT.md)
- [📄 完整总结](docs/FINAL_SUMMARY.md)

## 开发工具

位于 `dev-tools/` 目录：

- `verify-config.mjs` - 验证飞书配置
- `test-plugin.mjs` - 测试插件结构
- `test-integration.mjs` - 模拟 OpenCode 加载
- `setup-local-testing.mjs` - 配置本地测试
- `debug-events.mjs` - 事件调试指南

运行示例：
```bash
node dev-tools/verify-config.mjs
```

## 开发

```bash
# 安装依赖
npm install

# 类型检查
npm run typecheck

# 构建
npm run build

# 本地测试
node dev-tools/setup-local-testing.mjs
```

## 版本历史

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新记录。

## License

MIT
