# 抑制 subagent 退出通知噪音 - 任务清单

## 快速恢复

**当前阶段**: 阶段 3 - 验证与报告
**当前任务**: (none)
**进度**: 5/5 任务完成

---

## 阶段 1: 阶段 1 - 设计 ✅ COMPLETE

- [x] 确认 subagent 退出通知的触发路径并确定最小修复方案 | 验收: plan.md 写明问题定义、约束、风险分级和 design-lite 方案

---

## 阶段 2: 阶段 2 - 实现 ✅ COMPLETE

- [x] 修改通知过滤逻辑，避免 subagent 退出触发 idle 通知 | 验收: 主会话 idle 仍可通知，subagent 退出不再发送通知
- [x] 按需更新相关文档或消息说明 | 验收: 行为变化有对应说明，避免文档与实现不一致

---

## 阶段 3: 阶段 3 - 验证与报告 ✅ COMPLETE

- [x] 执行测试与代码评审，记录结果 | 验收: 生成 test-report.md 与 review-code.md，必要时生成 review-security.md
- [x] 生成 walkthrough 与 PR body | 验收: docs/report-walkthrough.md 与 docs/pr-body.md 已落盘

---

## 发现的新任务

(暂无)

---

*最后更新: 2026-03-21 22:07*
