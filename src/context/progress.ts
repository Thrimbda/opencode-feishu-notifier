import type { ProgressInfo } from "../types";

/**
 * 从事件负载中提取进度信息
 * @param eventPayload 事件负载
 * @returns 进度信息
 */
export function extractProgressInfo(eventPayload?: unknown): ProgressInfo {
  const timestamp = new Date().toISOString();

  // 尝试从事件负载中提取信息
  let lastAction: string | undefined;
  let currentTask: string | undefined;

  if (eventPayload && typeof eventPayload === "object") {
    const payload = eventPayload as Record<string, unknown>;

    // 尝试从常见字段提取信息
    if (typeof payload.message === "string") {
      lastAction = payload.message;
    } else if (typeof payload.description === "string") {
      lastAction = payload.description;
    } else if (typeof payload.action === "string") {
      lastAction = payload.action;
    }

    if (typeof payload.task === "string") {
      currentTask = payload.task;
    } else if (typeof payload.currentTask === "string") {
      currentTask = payload.currentTask;
    }
  }

  // 如果没有从负载中提取到信息，提供默认值
  if (!lastAction) {
    lastAction = "OpenCode 正在处理任务";
  }

  return {
    lastAction,
    currentTask,
    timestamp,
    // 文件变更信息需要从 Git 或其他来源获取，这里暂时留空
  };
}

/**
 * 从 Git 状态中提取文件变更信息
 * @param directory 工作目录
 * @returns 文件变更信息
 */
export function extractFileChanges(directory: string):
  | {
      added?: number;
      modified?: number;
      deleted?: number;
    }
  | undefined {
  try {
    const { execSync } = require("child_process");

    // 获取 Git 状态摘要
    const statusOutput = execSync("git status --porcelain", {
      cwd: directory,
      encoding: "utf-8",
    });

    let added = 0;
    let modified = 0;
    let deleted = 0;

    const lines = statusOutput.trim().split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;

      const status = line.substring(0, 2).trim();
      if (status === "A" || status.startsWith("A")) {
        added++;
      } else if (status === "M" || status.startsWith("M")) {
        modified++;
      } else if (status === "D" || status.startsWith("D")) {
        deleted++;
      } else if (status === "??") {
        added++; // 未跟踪的文件视为新增
      }
    }

    if (added > 0 || modified > 0 || deleted > 0) {
      return { added, modified, deleted };
    }
  } catch (error) {
    // Git 命令失败或不是 Git 仓库
  }

  return undefined;
}

/**
 * 创建带文件变更信息的进度信息
 * @param eventPayload 事件负载
 * @param directory 工作目录
 * @returns 完整的进度信息
 */
export function createProgressInfo(
  eventPayload?: unknown,
  directory?: string
): ProgressInfo {
  const baseInfo = extractProgressInfo(eventPayload);

  // 如果提供了目录，尝试获取文件变更信息
  if (directory) {
    const fileChanges = extractFileChanges(directory);
    if (fileChanges) {
      return {
        ...baseInfo,
        fileChanges,
      };
    }
  }

  return baseInfo;
}

/**
 * 格式化进度信息为可读文本
 * @param progress 进度信息
 * @returns 格式化后的文本
 */
export function formatProgressInfo(progress: ProgressInfo): string {
  const lines: string[] = [];

  // 格式化时间戳
  const time = new Date(progress.timestamp);
  const timeStr = time.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  lines.push(`• 时间：${timeStr}`);

  if (progress.lastAction) {
    lines.push(`• 最近操作：${progress.lastAction}`);
  }

  if (progress.currentTask) {
    lines.push(`• 当前任务：${progress.currentTask}`);
  }

  // 添加文件变更信息
  if (progress.fileChanges) {
    const changes = progress.fileChanges;
    const changeParts: string[] = [];

    if (changes.added && changes.added > 0) {
      changeParts.push(`新增 ${changes.added} 个文件`);
    }
    if (changes.modified && changes.modified > 0) {
      changeParts.push(`修改 ${changes.modified} 个文件`);
    }
    if (changes.deleted && changes.deleted > 0) {
      changeParts.push(`删除 ${changes.deleted} 个文件`);
    }

    if (changeParts.length > 0) {
      lines.push(`• 文件变更：${changeParts.join("，")}`);
    }
  }

  return lines.join("\n");
}
