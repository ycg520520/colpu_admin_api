/**
 * @Author: colpu
 * @Date: 2026-05-01 23:21:03
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-15 11:41:45
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { VIAPI_FUN } from './viapi.js';
import { BAILIAN_MODELS } from './bailian.js';

export const composeSizePrompt = (prompt, size = '1k') => {
  return prompt.replace(/{size}/g, size);
};

/**
 * @function normalizeVariables
 * @description
 * 序列化 prompt_variables，支持多种前端传参格式，统一为 { name, value } 形式，
 * @param {unknown} vars
 * @returns {Array<{ name: string, value: string }>} 标准化后的变量数组
 * @description 支持以下输入格式：
 * { name: string, value: string } - 直接提供 name 和 value。
 */
export function normalizeVariables(vars) {
  if (!Array.isArray(vars) || !vars.length) return [];
  return vars
    .map((v) => {
      if (!v || typeof v !== "object" || !v.name) return null;
      const { name, value } = v;
      if (value != null) return { name, value };
      return { name, value: "" };
    })
    .filter(Boolean);
}
/**
 * @function composePrompt
 * @description
 * 将主提示词与变量进行组合，生成最终的提示词字符串。
 * - 主提示词（prompt）可以包含变量占位符，如 {size}，会被替换为实际值。
 * - 变量（promptVariables）支持格式：{ name, value }。
 * - 如果 prompt 为 null 或 undefined，则视为 "" 处理。
 * @param {string|null|undefined} prompt - 主提示词，可能包含变量占位符。
 * @param {unknown} promptVariables - 变量列表，用于替换主提示词中的占位符。
 * @returns {string} 组合后的提示词字符串。
 * @example
 * const prompt = "生成一张{size}的图片";
 * const variables = [
 *   { name: "size", value: "512x512" },
 * ];
 * const result = composePrompt(prompt, variables);
 * console.log(result); // 输出: "生成一张512x512的图片"
 */
export const composePrompt = (prompt, promptVariables) => {
  if (!prompt) return "";
  let out = prompt;
  const vars = normalizeVariables(promptVariables);
  if (!Array.isArray(vars) || !vars.length) return out;
  for (const v of vars) {
    if (!v || typeof v !== "object") continue;
    const name = v.name;
    if (!name) continue;
    let val = "";
    if (v.value != null) val = String(v.value);
    const token = `{${name}}`;
    if (out.includes(token)) out = out.split(token).join(val);
  }
  return out;
}

/**
 * @function composeTemplatePrompt
 * @description
 * 根据模版对象构建提示词字符串，模版对象包含 prompt 和 prompt_variables 字段。
 * - 模版提示词（template.prompt）可以包含变量占位符，如 {size}，会被替换为实际值。
 * - 模版变量（template.prompt_variables）支持两种格式：{ name, value } 或 { name, values: [{ value }] }。
 * - 如果 template.prompt 为 null 或 undefined，则视为 "" 处理。
 * - 与 {@link composePrompt} 行为一致，仅数据来源为 template。
 * @param {{ prompt?: string, prompt_variables?: unknown }} template
 * @return {string} 组合后的提示词字符串。
 * @example
 * const template = {
 *   prompt: "请生成一张{size}的{color}图片",
 *   prompt_variables: [
 *     { name: "size", value: "512x512" },
 *   ]
 * };
 * const result = composeTemplatePrompt(template);
 * console.log(result); // 输出: "请生成一张512x512的red,blue图片"
 */
export const composeTemplatePrompt = (template) => {
  if (!template || typeof template !== "object") return "";
  const { prompt, prompt_variables } = template;
  return composePrompt(prompt, template.prompt_variables);
};

/**
 * @function generatePrompt
 * @description
 * 根据分类与请求 body 拼出最终提示词，供 Comfy / 百炼等通道直接使用（各工作流不再重复拼文案）。
 * - 主段：body.prompt 优先，否则用 classify.prompt；经 body.prompt_variables 占位替换、{size} 替换（body.size 或 classify.size，默认 1k）。
 * - 中间段（可选）：body.promptPositive 或 body.prompt_positive，trim 后非空则作为独立一段参与拼接。
 * - 模版段（可选）：body.templates，经 {@link composeTemplatePrompt} 得到文案，trim 后非空则参与拼接。
 * - 拼接顺序为主段、中间段、模版段，各段 trim，空段丢弃，段之间用换行符 \n 连接。
 * @param {object} opts
 * @param {Record<string, unknown>} opts.classify - 分类行（含 prompt、size 等）
 * @param {Record<string, unknown>} [opts.body={}] - 请求体（prompt、prompt_variables、prompt_positive / promptPositive、template、size 等）
 * @returns {string} 最终提示词
 * @example
 * const classify = { prompt: "生成一张{size}的图片", size: "512x512" };
 * const body = { prompt: "生成一张{size}的猫咪图片", prompt_variables: [{ name: "size", value: "256x256" }] };
 * generatePrompt({ classify, body }); // "生成一张256x256的猫咪图片"
 */
export function generatePrompt({ classify, body = {} }) {
  const size = getSize({ body, classify });
  let prompt = body.prompt || classify.prompt || '';
  prompt = composePrompt(prompt, body.prompt_variables);
  prompt = composeSizePrompt(prompt, size);
  const prompt_positive = body.prompt_positive;
  const tpls = body.templates || [];
  const templates = tpls.map((item) => {
    const { template, ...reset } = item;
    return {
      ...reset,
      prompt: composeTemplatePrompt(item.template).trim()
    }
  })
  return { prompt, prompt_positive, templates };
}

/**
 * @function fixSrc
 * @description
 * 将 CDN/外链 URL 转换为存库用的 upload/ 相对路径。
 * - 输入 URL 可能包含 "upload/"，取最后一个 "upload/" 及其后面的部分作为相对路径。
 * - 如果输入 URL 不包含 "upload/"，则直接返回整个 URL 路径。
 * @param {string} url - 输入的 CDN/外链 URL。
 * @returns {string} 转换后的 upload/ 相对路径。
 * @example
 * console.log(fixSrc("https://cdn.example.com/upload/image.jpg")); // 输出: "upload/image.jpg"
 */
export function fixSrc(url) {
  let arr = url.split("upload/");
  if (arr.length > 1) return `upload/${arr.pop()}`
  arr = url.split("static/");
  if (arr.length > 1) return `static/${arr.pop()}`
  return url;
}

export function getSize(data) {
  const { body, classify } = data;
  return body.size || classify.size || "1k";
}

/**
 * @param {string|undefined|null} model - classify.model
 * @returns {"viapi"|"bailian"|"comfyui"|"liblib"|"runninghub"|""}
 */
export function clientKeyByModel(model) {
  const m = String(model ?? "").trim();
  if (m.startsWith("runninghub")) return "runninghub";
  if (m.startsWith("liblib")) return "liblib";
  if (m.startsWith("comfyui")) return "comfyui";
  if (VIAPI_FUN.has(m)) return "viapi";
  if (Object.keys(BAILIAN_MODELS).includes(m)) return "bailian";
  return "";
}

/**
 * Comfy 路由键 `comfyui:workflow` → 工作流名
 * @param {string|undefined|null} model
 */
export function workflowName(model) {
  const m = String(model ?? "").trim();
  if (m.startsWith("comfyui:")) return m.slice("comfyui:".length).trim();
  return "";
}

/**
 * Liblib 路由键 `liblib:{templateUuid}` → templateUuid
 * @param {string|undefined|null} model
 */
export function liblibTemplateUuid(model) {
  const m = String(model ?? "").trim();
  if (!m.startsWith("liblib:")) return "";
  return m.slice("liblib:".length).trim();
}

/**
 * RunningHub 路由键 `runninghub:{key}` → workflow key
 */
export function runningHubKey(model) {
  const m = String(model ?? "").trim();
  if (!m.startsWith("runninghub:")) return "";
  return m.slice("runninghub:".length).trim();
}

/** body.images[0]，无则空串 */
export function firstImage(images) {
  if (Array.isArray(images) && images.length) return images[0];
  return "";
}

/**
 * @function progressStatus
 * @description
 * 将任务状态标准化为 PENDING/RUNNING/SUCCEEDED/FAILED 四种状态，CANCELED 归并为 FAILED，UNKNOWN 归并为 PENDING。
 * @param {string|undefined} task_status
 * @returns {"PENDING"|"RUNNING"|"SUCCEEDED"|"FAILED"}
 */
export function progressStatus(task_status) {
  switch (task_status) {
    case "PENDING":
    case "RUNNING":
    case "SUCCEEDED":
    case "FAILED":
      return task_status;
    case "CANCELED":
      return "FAILED";
    case "UNKNOWN":
      return "PENDING";
    default:
      return "PENDING";
  }
}

export function composeImageUrls(data) {
  const urls = [];
  const push = (item) => {
    if (!item || typeof item !== "object") return;
    const u = item.fileUrl ?? item.url ?? item.imageUrl;
    if (typeof u === "string" && u.trim()) urls.push(u.trim());
  };
  if (Array.isArray(data)) {
    data.forEach(push);
  } else if (data && typeof data === "object") {
    if (Array.isArray(data.results)) data.results.forEach(push);
    if (Array.isArray(data.images)) data.images.forEach(push);
    push(data);
  }
  return urls;
}
