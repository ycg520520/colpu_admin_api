/**
 * @Author: colpu
 * @Date: 2026-05-30 10:59:26
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-16 13:57:24
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
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { composePrompt, normalizeVariables } from "../utils.js";
const RUNNINGHUB_DIR = path.dirname(fileURLToPath(import.meta.url));
const _workflowSchemaCache = Object.create(null);

export const RUNNINGHUB_CONFIG = {
  baseUrl: "https://www.runninghub.cn",
  workflows: {
    "2030897076795609089": {
      name: "一键证件照",
      workflowId: "2030897076795609089",
      path: "workflows/一键证件照V2_侧脸转正_换服装_换背景_高清_排版_api.json",
    },
    "1946963516941328385": {
      name: "老照片修复",
      workflowId: "1946963516941328385",
      path: "workflows/Kontext-老照片修复_api.json",
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

export function loadWorkflow(wf) {
  const file = resolveWorkflowApiPath(wf);
  if (!_workflowSchemaCache[file]) {
    _workflowSchemaCache[file] = JSON.parse(readFileSync(file, "utf8"));
  }
  return _workflowSchemaCache[file];
}

export function assertWorkflowNodes(wf, nodes) {
  const workflow = loadWorkflow(wf);
  for (const [key, nodeId] of Object.entries(nodes)) {
    if (Array.isArray(nodeId)) {
      for (const id of nodeId) {
        if (!workflow[id]) {
          throw new Error(`工作流缺少节点 ${id}（${key}）`);
        }
      }
    } else {
      if (!workflow[nodeId]) {
        throw new Error(`工作流缺少节点 ${nodeId}（${key}）`);
      }
    }
  }
  return workflow;
}
export function getNodeInfoList(patches) {
  const list = [];
  for (const [nodeId, inputs] of Object.entries(patches)) {
    for (const [fieldName, fieldValue] of Object.entries(inputs)) {
      list.push({ nodeId, fieldName, fieldValue });
    }
  }
  return list;
}

export function collectVarMap(promptVariables) {
  const list = normalizeVariables(promptVariables);
  const map = Object.create(null);
  for (const { name, value } of list) {
    if (!name) continue;
    map[name] = value;
  }
  return map;
}

export function parseTruthy(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const s = String(value ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (["1", "true", "yes", "on", "开启", "开", "是"].includes(s)) return true;
  if (["0", "false", "no", "off", "关闭", "关", "否"].includes(s)) return false;
  return undefined;
}

export function parseHD(size) {
  return ['4k', '8k'].includes(size)
}
