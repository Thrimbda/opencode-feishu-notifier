# opencode-feishu-plugin

## 目标

实现 opencode 飞书通知插件并建立 npm 发布的 GitHub Actions 流程


## 要点

- 完善插件打包为可发布 npm 包
- 新增 GitHub Actions 发布流程（基于 tag/release）
- 使用 npm 的新 token 管理方式进行认证
- 保持发布流程简洁可复用


## 范围

- `package.json` / `tsconfig.json` / `tsup.config.ts`
- `src/index.ts`（插件入口）
- `src/cli.ts`（setup 命令入口）
- `src/config.ts`（环境变量校验）
- `src/feishu/client.ts`（鉴权与发送）
- `src/feishu/messages.ts`（事件模板）
- `src/hooks.ts`（事件映射）

## 设计方案

### 核心流程

1. `setup` 命令读取环境变量 → 获取 tenant access token → 返回成功/失败
2. 插件初始化时加载环境变量配置 → 未满足则抛出可读错误
3. opencode 事件触发时进入 `event` hook → 映射为通知类型
4. Feishu 客户端发送消息 → 失败则写入日志并抛错

### 接口定义

**环境变量**

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_RECEIVER_TYPE`：`user_id` | `open_id` | `chat_id`
- `FEISHU_RECEIVER_ID`

**事件映射（草案）**

- `permission.updated` → `permission_required`
- `tui.prompt.append` → `interaction_required`
- `tui.command.execute` → `command_args_required`
- `tui.toast.show` → `confirmation_required`

### 文件变更明细

| 文件 | 变更 | 说明 |
| --- | --- | --- |
| `package.json` | 新增 | npm 包信息与脚本 |
| `tsconfig.json` | 新增 | TS 配置 |
| `tsup.config.ts` | 新增 | 构建输出配置 |
| `src/index.ts` | 新增 | 插件入口 |
| `src/cli.ts` | 新增 | `setup` 命令 |
| `src/config.ts` | 新增 | 环境变量校验 |
| `src/feishu/client.ts` | 新增 | 认证与消息发送 |
| `src/feishu/messages.ts` | 新增 | 事件消息模板 |
| `src/hooks.ts` | 新增 | 事件映射逻辑 |

## 阶段概览

1. **设计与确认** - 1 个任务
2. **实现** - 4 个任务
3. **收尾** - 1 个任务

---

*创建于: 2026-01-13 | 最后更新: 2026-01-14*
