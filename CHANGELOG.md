# 更新日志

## [未发布] - 2026-01-16

### 修复
- 修复插件导出格式问题：从具名导出改为默认导出，解决插件无法初始化的问题
- 修复配置文件格式问题：移除错误的 `feishuNotifier` 嵌套层级

### 新增
- 新增 OpenCode 闲暇状态通知 (`session.status` with `idle`)
- 新增需要选择方案通知 (`question.asked`)
- 新增权限请求通知 (`permission.asked`)
- 新增对 `permission.updated` 事件的支持（权限更新）

### 改进
- 改进事件处理逻辑，支持检查 `session.status` 中的具体状态类型
- 添加调试日志记录所有接收到的事件（DEBUG 级别）

### 开发工具
- 添加本地测试配置脚本 (`setup-local-testing.mjs`)
- 添加配置验证脚本 (`verify-config.mjs`)
- 添加插件结构测试脚本 (`test-plugin.mjs`, `test-integration.mjs`)
- 添加事件调试指南 (`debug-events.mjs`)

### 文档
- 添加快速开始指南 (`QUICK_START.md`)
- 添加本地开发文档 (`LOCAL_DEVELOPMENT.md`)
- 添加测试报告 (`TEST_REPORT.md`)
- 添加新事件支持说明 (`NEW_EVENTS.md`)

## [0.2.6] - 之前

- 初始版本功能
