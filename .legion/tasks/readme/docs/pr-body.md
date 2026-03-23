# What

本 PR 仅更新 `README.md`，补齐首次接入用户最容易遗漏的三类说明：项目来源、AGENT 自动配置后的重启步骤，以及飞书机器人完整配置指南。
本次改动只总结 README 的文档更新，不包含运行时代码、配置结构或接口行为调整。

# Why

当前 README 缺少 `github:thrimbda/legion-mind` 来源背景，AGENT 自动配置流程也没有明确提醒“配置后需重启 OpenCode”，容易让用户误以为插件未生效。
同时，仓库此前缺少一段从飞书应用创建到机器人发布、再到 `receiverType`/`receiverId` 配置落地的集中说明，首次接入成本偏高。

# How

在 README 顶部新增来源说明，补齐仓库背景信息。
在 AGENT 自动配置指南中加入“配置后重启 OpenCode”步骤，并调整验证时机。
新增飞书机器人配置指南，覆盖自建应用、机器人能力、最小权限、可用范围/成员、`receiverType`/`receiverId`、飞书发布与 npm 发布流程。

# Testing

- `PASS` - 文档一致性核对，详见 `/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/docs/test-report.md`
- `PASS` - 文档评审，详见 `/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/docs/review-code.md`

# Risk / Rollback

- 风险：Low；仅为 README 文档更新，无 `review-security.md`，因为本任务未触及安全边界。
- 回滚：直接回退 `README.md` 的本次文档改动即可，无需额外迁移或环境操作。

# Links

- Plan: `/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/plan.md`
- RFC: N/A（本任务按 design-lite 执行，无独立 RFC）
- Review: `/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/docs/review-code.md`
- Walkthrough: `/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/docs/report-walkthrough.md`
