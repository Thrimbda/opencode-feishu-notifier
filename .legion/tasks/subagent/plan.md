# 抑制 subagent 退出通知噪音

## 任务元信息

- 风险分级: Low
- 规模分级: 非 Epic
- 标签: 无
- 设计策略: design-lite（不单独产出 RFC）

## 目标

调整飞书通知触发逻辑，仅在主会话进入 idle 时发送闲暇通知，避免 subagent 退出时产生噪音。

## 问题定义

当前插件会把 `session.status` 且 `status.type === "idle"` 统一映射为 `session_idle` 通知。OpenCode 在 subagent 退出时也会进入 idle，因此用户会收到额外的飞书消息。这类消息通常不需要人工介入，反而会淹没真正重要的权限、提问和确认类通知。

## 验收标准

- 主会话完成后进入 idle，仍然会发送飞书通知。
- subagent/子会话退出进入 idle 时，不再发送飞书通知。
- 权限请求、问题选择、确认提示、补充输入等现有通知行为保持不变。
- README 中对闲暇通知的说明与实际行为一致。
- 产出 `test-report.md`、`review-code.md`、`report-walkthrough.md`、`pr-body.md`。

## 假设

- OpenCode 的子会话可以通过 `sessionID` 对应的会话元数据识别，优先依据 `parentID` 判断是否为子会话。
- 当事件携带 `sessionID` 时，优先通过 `client.session.get()` 查询会话详情，并依据返回的 `parentID` 判断是否为子会话；查询失败时再回退到事件字段。
- 无需为本次修复新增用户配置项，默认静默过滤子会话 idle 通知即可满足需求。

## 约束

- 只收紧 `session_idle` 的发送条件，不扩大其它事件的过滤范围。
- 不修改飞书发送协议和消息模板格式，避免引入额外兼容性风险。
- 保持改动在既有插件入口与事件解析逻辑内，避免越界到无关模块。

## 风险说明

- 风险低：改动集中在通知过滤逻辑，可回滚，且不涉及配置迁移或外部接口变更。
- 主要风险是误判主/子会话导致漏发闲暇通知，因此实现上优先选择保守策略：能确认是子会话就过滤，无法确认时维持原有通知行为。

## 要点

- 梳理 `session.status` idle 通知的触发上下文，区分主会话与 subagent 会话。
- 在不影响权限、提问、确认等高价值通知的前提下，收紧 idle 通知条件。
- 产出测试、评审、walkthrough 与 PR body，支持直接进入 Review。

## 允许 Scope

- `src/index.ts`
- `src/feishu/messages.ts`
- `README.md`
- `.legion/tasks/subagent/`

## Design Index

- design-lite: `./plan.md#design-lite`
- 实现验证: `./docs/test-report.md`
- 代码评审: `./docs/review-code.md`
- 交付说明: `./docs/report-walkthrough.md`
- PR 描述: `./docs/pr-body.md`

## Phase Map

1. 设计: 确认 idle 事件如何识别子会话，并固化最小修复方案。
2. 实现: 在事件入口增加主/子会话过滤，仅屏蔽子会话 idle 通知。
3. 验证与报告: 执行类型检查、代码评审并生成交付文档。

## design-lite

### 方案摘要

在 idle 事件被映射为 `session_idle` 之前，先判断触发事件所属会话是否为子会话：

1. 从事件中提取 `sessionID`，用于定位当前会话。
2. 如果拿到 `sessionID`，优先使用 `client.session.get({ id: sessionID })` 查询会话元数据，并检查返回结果中的 `parentID`。
3. 只有在查询不可用或失败时，才回退使用事件自身携带的 `parentID` 与本地缓存信息。
4. 仅当会话为根会话时才继续发送 `session_idle`；其它事件类型不受影响。

### 为什么这样做

- 过滤点放在事件入口，最接近发送决策，改动最小。
- 基于会话父子关系判断，比依赖标题或 agent 名称更稳健。
- 查询失败时保持原有行为，可降低因 OpenCode 字段差异导致的主流程漏报风险。

### 非目标

- 本次不新增 `notifyChildSessions` 等可配置开关。
- 本次不重构消息模板系统或改用新的事件类型。

---

*创建于: 2026-03-21 | 最后更新: 2026-03-21*
