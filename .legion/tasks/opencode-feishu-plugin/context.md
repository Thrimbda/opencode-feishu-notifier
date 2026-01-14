# opencode-feishu-plugin - 上下文

## 会话进展 (2026-01-13)

### ✅ 已完成

- 澄清初版设计方案（MCP 方案）并等待确认
- 确认插件机制与事件映射
- 设计方案获确认，进入实现阶段
- 搭建 TS 项目与构建配置
- 实现飞书鉴权与消息发送
- 实现 setup 命令发送测试消息
- 实现事件 hook 通知逻辑
- 新增自动 setup 脚本用于构建与安装插件
- 修复 client.app.log 调用签名，构建成功
- 新增 GitHub Actions 发布流程（OIDC Trusted Publishers）
- 新增 .gitignore 用于 Node.js/TypeScript 项目
- 更新 setup 脚本以配置 npm 插件
- 修复 CLI shebang，确保 npx 可执行
- 改为从 opencode.json 读取 feishuNotifier 配置
- 新增 JS setup 脚本取代 shell 版本
- 移除旧的 setup.sh 脚本
- 支持从环境变量或 feishu-notifier.json 读取配置
- 新增 debug 日志输出（配置来源/事件/发送结果）
- 移除飞书 setup CLI，改为仅通过配置文件/环境变量
- 调整 package.json 以发布源码并使用 bun 作为引擎
- 调整 release workflow 使用 bun + Trusted Publishers 并添加 typecheck 脚本


### 🟡 进行中

(暂无)


### ⚠️ 阻塞/待定

(暂无)


---

## 关键文件

(暂无)

---

## 关键决策

| 决策 | 原因 | 替代方案 | 日期 |
|------|------|----------|------|
| 以 MCP Server 形式实现 opencode 插件，通过 `notify` 工具被 opencode 调用发送飞书通知 | opencode 配置仅支持外部 MCP Server 扩展，适合独立 npm 包实现 | 直接修改 opencode 源码注入通知逻辑；制作包装器监听日志触发通知 | 2026-01-13 |
| 改用 opencode 插件 hook 机制实现通知逻辑 | 官方插件支持事件 hook，满足需求且比 MCP Server 更轻量 | 继续使用 MCP Server 提供 notify 工具；在 opencode 源码中硬编码通知 | 2026-01-13 |
| 使用 client.app.log 的 body 结构以匹配 SDK 类型 | SDK 类型 AppLogData 需要 body 字段 | 关闭 DTS 生成或改用 console.log | 2026-01-14 |
| 使用 tsup banner 添加 shebang 以支持 npm bin 执行 | npx 执行需要可执行 shebang，否则会被 shell 误解析 | 在发布后增加 postinstall 脚本注入 shebang | 2026-01-14 |
| 插件配置从 opencode.json 的 feishuNotifier 字段读取 | 用户要求移除环境变量依赖，集中在 opencode 配置文件中 | 保留环境变量作为 fallback 或使用独立配置文件 | 2026-01-14 |
| 配置文件从 opencode.json 迁移为 feishu-notifier.json，避免 opencode 配置校验失败 | opencode.json 不允许未知字段 | 仅保留环境变量或使用项目级 .opencode/feishu-notifier.json | 2026-01-14 |
| 移除 npm bin setup CLI，避免额外发布入口 | 用户要求仅保留插件与配置文件，不再提供 CLI | 保留 CLI 作为可选命令 | 2026-01-14 |
| 发布 TypeScript 源码并声明 bun 引擎 | 匹配用户期望与社区插件模式（无需构建产物） | 继续发布 dist 构建产物 | 2026-01-14 |

---

## 快速交接

**下次继续从这里开始：**

1. 运行 `npm install` 后执行 `npm run build` 生成 dist 文件
2. 在 opencode 配置中加入插件包或拷贝 `dist/index.js` 到 `.opencode/plugin/`
3. 设置环境变量并运行 `opencode-feishu-setup` 发送测试消息

**注意事项：**

- 插件会在 `permission.updated`/`tui.prompt.append`/`tui.command.execute`/`tui.toast.show` 事件触发时发送通知
- 缺少环境变量会导致插件初始化报错

---

*最后更新: 2026-01-14 17:02 by Claude*
