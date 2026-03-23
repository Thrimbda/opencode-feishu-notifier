# README 文档任务 Walkthrough

## 目标与范围

- 目标：补齐 `README.md` 中影响首次接入体验的关键信息，降低用户在配置来源认知、插件生效时机与飞书机器人接入上的理解成本。
- 范围：仅覆盖 `README.md` 的本次文档更新；忽略仓库其他未提交变更。
- 绑定 scope：`/Users/c1/Work/opencode-feishu-notifier/README.md`

## 设计摘要

- 本任务按 Low 风险 `design-lite` 执行，无独立 RFC。
- 设计入口见 `/.legion/tasks/readme/plan.md` 的 `design-lite` 段落：`/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/plan.md`
- 设计策略是最小增量更新 README：在顶部补充项目来源说明、在 AGENT 自动配置流程中补充“配置后重启 OpenCode”步骤、并新增一节完整的飞书机器人配置指南。

## 改动清单

### README

- `README.md`
- 在文档顶部新增项目来源说明，明确当前插件基于 `github:thrimbda/legion-mind` 的 vibe coding 方式完成，补齐仓库背景。
- 在 AGENT 自动配置指南中新增“配置后重启 OpenCode”步骤，并调整验证顺序，避免用户在未重启时误判配置未生效。
- 新增飞书机器人配置指南，覆盖自建应用、开启机器人能力、最小权限、可用范围/成员、`receiverType`/`receiverId`、飞书发布与 npm 发布等关键环节。

## 如何验证

- 验证方式：文档一致性核对。
- 执行命令：`git diff -- README.md`
- 预期结果：README 中可见三类新增内容，且表述与仓库当前实现一致，无自相矛盾或缺失关键步骤的问题。
- 验证结论：`PASS`
- 验证报告：`/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/docs/test-report.md`
- 评审结论：`PASS`
- 评审报告：`/Users/c1/Work/opencode-feishu-notifier/.legion/tasks/readme/docs/review-code.md`

## 风险与回滚

- 风险等级：Low。
- 风险说明：本次仅更新 README，不涉及运行时代码、配置结构、接口调用或安全边界变更。
- 已知风险：飞书开放平台后台文案若后续调整，README 中的权限或路径描述可能需要同步更新。
- 回滚方式：如需回滚，直接撤回 `README.md` 的本次文档改动即可；无需数据迁移、配置清理或发布回退。

## 未决项与下一步

- 当前无阻塞未决项。
- 可选优化：后续可按 `review-code.md` 的非阻塞建议，补充飞书后台权限文案以平台展示为准、补出已安装版本示例，以及提示不要混用本地路径与 npm 包名配置。
- 下一步：可直接使用 `pr-body.md` 发起评审或创建 PR。
