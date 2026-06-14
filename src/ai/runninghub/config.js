/**
 * @Author: colpu
 * @Date: 2026-05-30 10:59:26
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-02 15:45:11
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * RunningHub 工作流注册表
 *
 * classify.model 格式：runninghub:{workflowId}
 * path：相对本目录的 ComfyUI API 导出 JSON，供 idPhotoParams 校验节点并生成 workflow 覆盖
 *
 * @see https://www.runninghub.cn/call-api/api-detail/2030897076795609089?apiType=5
 */
import path from "path";
import { fileURLToPath } from "url";

const RUNNINGHUB_DIR = path.dirname(fileURLToPath(import.meta.url));

export const RUNNINGHUB_CONFIG = {
  baseUrl: "https://www.runninghub.cn",
  workflows: {
    "2030897076795609089": {
      name: "一键证件照",
      workflowId: "2030897076795609089",
      path: "workflows/一键证件照V2_侧脸转正_换服装_换背景_高清_排版_api.json",
   },
  },
};

/**
 * @param {object} wf 工作流配置项（含 path）
 * @returns {string} ComfyUI API JSON 绝对路径
 */
export function resolveWorkflowApiPath(wf) {
  const p = wf?.path;
  if (!p || !String(p).trim()) {
    throw new Error(`RunningHub 工作流未配置 path: ${wf?.workflowId ?? wf?.name ?? "unknown"}`);
  }
  return path.isAbsolute(p) ? p : path.join(RUNNINGHUB_DIR, p);
}

/**
 * @param {object} [optionOverrides] .config.js → runninghubOption.workflows
 */
export function loadRunningHubConfig(optionOverrides) {
  const { baseUrl, workflows } = RUNNINGHUB_CONFIG;
  return {
    baseUrl: String(baseUrl).replace(/\/$/, ""),
    workflows: {
      ...workflows,
      ...(optionOverrides && typeof optionOverrides === "object" ? optionOverrides : {}),
    },
  };
}
