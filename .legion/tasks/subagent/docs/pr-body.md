## What

本 PR 修复 subagent 退出进入 idle 时误发飞书通知的问题。
现在仅在确认会话不是子会话时才发送 `session_idle` 通知，避免低价值噪音打断用户，同时不影响权限、提问、确认等现有通知路径。

## Why

此前插件会把所有 `session.status` + `idle` 统一映射为闲暇通知，而 OpenCode 的 subagent 退出时同样会进入 idle。
这会产生额外飞书消息，稀释真正需要人工处理的通知信号，因此需要把 idle 通知收紧到主会话/根会话。

## How

- 在 `src/index.ts` 的 idle 分支增加发送前判定，仅当 `shouldSendSessionIdleNotification()` 返回 true 时才发送。
- 在 `src/feishu/messages.ts` 中通过事件字段、会话缓存和必要时的 `client.session.get()` 解析 `parentID`，识别子会话并过滤 idle 通知。
- 调整会话元数据缓存写入逻辑，避免已知 `parentID` 被 `undefined` 覆盖；同步更新 `README.md` 说明当前行为。

## Testing

- `npm run typecheck` -> PASS
- 详情见 `./test-report.md`
- 代码评审结论见 `./review-code.md`（PASS，只有非阻塞建议）

## Risk / Rollback

- 风险：主/子会话识别错误可能导致 idle 通知漏发；当前通过“仅在确认是子会话时过滤”的保守策略降低风险。
- 已知后续优化项：`sessionMetadataCache` 暂无淘汰策略，长期运行时可能有轻微内存增长。
- 回滚：移除 idle 发送前的子会话判定与相关缓存逻辑，并同步回退 `README.md` 文案即可恢复旧行为。

## Links

- Plan: `../plan.md`
- Design: `../plan.md#design-lite`
- Test report: `./test-report.md`
- Code review: `./review-code.md`
- Walkthrough: `./report-walkthrough.md`
