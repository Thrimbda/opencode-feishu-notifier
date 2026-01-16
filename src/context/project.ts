import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { ProjectContext } from "../types";

/**
 * 提取项目上下文信息
 * @param directory 工作目录路径
 * @returns 项目上下文信息
 */
export async function extractProjectContext(
  directory: string
): Promise<ProjectContext> {
  const workingDir = path.resolve(directory);

  // 从 package.json 提取项目名称，否则使用目录名
  const projectName = await extractProjectName(workingDir);

  // 检查是否为 Git 仓库并提取信息
  const gitInfo = await extractGitInfo(workingDir);

  return {
    projectName,
    branch: gitInfo.branch,
    workingDir,
    repoUrl: gitInfo.repoUrl,
    isGitRepo: gitInfo.isGitRepo,
  };
}

/**
 * 从 package.json 或目录名提取项目名称
 */
async function extractProjectName(directory: string): Promise<string> {
  const packageJsonPath = path.join(directory, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    try {
      const content = await fs.promises.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);
      if (packageJson.name) {
        return packageJson.name;
      }
    } catch {
      // 如果读取失败，使用目录名
    }
  }

  // 使用目录名作为项目名
  return path.basename(directory);
}

/**
 * 提取 Git 仓库信息
 */
async function extractGitInfo(directory: string): Promise<{
  isGitRepo: boolean;
  branch?: string;
  repoUrl?: string;
}> {
  const gitDir = path.join(directory, ".git");

  if (!fs.existsSync(gitDir)) {
    return { isGitRepo: false };
  }

  try {
    // 获取当前分支
    const branch = execSync("git branch --show-current", {
      cwd: directory,
      encoding: "utf-8",
    }).trim();

    // 获取远程仓库 URL
    let repoUrl: string | undefined;
    try {
      const remoteUrl = execSync("git config --get remote.origin.url", {
        cwd: directory,
        encoding: "utf-8",
      }).trim();

      if (remoteUrl) {
        // 转换 SSH URL 为 HTTPS URL（如果适用）
        repoUrl = convertGitUrlToWeb(remoteUrl);
      }
    } catch {
      // 无法获取远程 URL，忽略
    }

    return {
      isGitRepo: true,
      branch: branch || undefined,
      repoUrl,
    };
  } catch (error) {
    // Git 命令失败，但目录中有 .git 文件夹
    return { isGitRepo: true };
  }
}

/**
 * 转换 Git URL 为可访问的 Web URL
 */
function convertGitUrlToWeb(gitUrl: string): string {
  // 移除 .git 后缀
  let url = gitUrl.replace(/\.git$/, "");

  // 转换 SSH URL 为 HTTPS URL
  // git@github.com:user/repo -> https://github.com/user/repo
  if (url.startsWith("git@")) {
    url = url.replace(":", "/").replace("git@", "https://");
  }

  return url;
}

/**
 * 简化版：同步提取项目上下文（用于简单场景）
 */
export function extractProjectContextSync(directory: string): ProjectContext {
  const workingDir = path.resolve(directory);
  const projectName = extractProjectNameSync(workingDir);
  const gitInfo = extractGitInfoSync(workingDir);

  return {
    projectName,
    branch: gitInfo.branch,
    workingDir,
    repoUrl: gitInfo.repoUrl,
    isGitRepo: gitInfo.isGitRepo,
  };
}

/**
 * 同步提取项目名称
 */
function extractProjectNameSync(directory: string): string {
  const packageJsonPath = path.join(directory, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    try {
      const content = fs.readFileSync(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);
      if (packageJson.name) {
        return packageJson.name;
      }
    } catch {
      // 如果读取失败，使用目录名
    }
  }

  return path.basename(directory);
}

/**
 * 同步提取 Git 信息
 */
function extractGitInfoSync(directory: string): {
  isGitRepo: boolean;
  branch?: string;
  repoUrl?: string;
} {
  const gitDir = path.join(directory, ".git");

  if (!fs.existsSync(gitDir)) {
    return { isGitRepo: false };
  }

  try {
    // 获取当前分支
    const branch = execSync("git branch --show-current", {
      cwd: directory,
      encoding: "utf-8",
    }).trim();

    // 获取远程仓库 URL
    let repoUrl: string | undefined;
    try {
      const remoteUrl = execSync("git config --get remote.origin.url", {
        cwd: directory,
        encoding: "utf-8",
      }).trim();

      if (remoteUrl) {
        repoUrl = convertGitUrlToWeb(remoteUrl);
      }
    } catch {
      // 无法获取远程 URL，忽略
    }

    return {
      isGitRepo: true,
      branch: branch || undefined,
      repoUrl,
    };
  } catch (error) {
    return { isGitRepo: true };
  }
}
