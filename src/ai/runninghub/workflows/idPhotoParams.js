/**
 * @Author: colpu
 * @Date: 2026-06-04 16:25:24
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-05 22:51:37
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * RunningHub 证件照工作流（2030897076795609089）参数构建
 *
 * 将 indian 上传页的 body / template / classify 转为 RunningHub 创建任务所需参数：
 * - nodeInfoList：覆盖各节点标量字段（背景、服装、发型、尺寸等）
 * - workflow：完整 ComfyUI API 图 JSON，用于排版开关与 SaveImage 连线（nodeInfoList 无法改 [] 连线）
 *
 * 工作流定义文件见 config.workflows[].path（同目录 *_api.json）
 *
 * @see https://www.runninghub.cn/call-api/api-detail/2030897076795609089?apiType=5
 */
import { readFileSync } from "fs";
import { randomInt } from "crypto";
import { composePrompt, normalizeVariables } from "../../utils.js";
import { resolveWorkflowApiPath } from "../config.js";

/** 客户端「背景颜色」文案 → 孤海-取色器主色 */
const ID_PHOTO_BG_HEX = {
  蓝色: "#438EDB",
  红: "#BE0D23",
  红色: "#BE0D23",
  白色: "#FFFFFF",
  白: "#FFFFFF",
  灰色: "#364254",
  灰: "#364254",
};

/**
 * 可通过 nodeInfoList / workflow 覆盖的节点（id 须与 *_api.json 一致）
 *
 * | key               | id  | 说明 |
 * |-------------------|-----|------|
 * | loadImage         | 35  | 用户照片 LoadImage，fieldValue 为公网 URL |
 * | crop              | 36  | 主流程证件照裁剪（像素） |
 * | clothing          | 284 | 服装选择器 |
 * | hairstyle         | 294 | 发型选择器 |
 * | extraText         | 195 | 额外提示词 |
 * | skinToggle        | 318 | 美颜开关 |
 * | hdToggle          | 319 | 超高清开关（body.size === classify.size_hd） |
 * | bgPicker          | 336 | 背景色 |
 * | seed              | 289 | 随机种子 |
 * | layout            | 70  | 孤海-单尺寸排版（相纸宽高，厘米） |
 * | layoutCrop        | 71  | 排版分支裁剪（照片尺寸，厘米） |
 * | layoutGroupSwitch | 323 | 排版分组开关（仅 workflow JSON，API 导出 inputs 为空） |
 * | saveImage         | 315 | 最终保存；排版开启时 images 须指向 70 |
 */
export const ID_PHOTO_NODES = {
  loadImage: "35",
  crop: "36",
  clothing: "284",
  hairstyle: "294",
  extraText: "195",
  skinToggle: "318",
  hdToggle: "319",
  bgPicker: "336",
  seed: "289",
  layout: "70",
  layoutCrop: "71",
  layoutGroupSwitch: "323",
  saveImage: "315",
  previewImage: "340",
};

/** 排版照片预设 → 节点 71「预设尺寸」选项文案 */
const LAYOUT_PHOTO_PRESET = {
  "1寸": "1寸（2.5 x 3.5 厘米）",
  "大1寸": "大1寸（3.3 x 4.8 厘米）",
  "小2寸": "小2寸（3.5 x 4.5 厘米）",
  "2寸": "2寸（3.5 x 4.9 厘米）",
  "大2寸": "大2寸（3.5 x 5.3 厘米）",
  "3寸": "3寸（5.5 x 8.5 厘米）",
  "5寸": "5寸（8.9 x 12.7 厘米）",
  "6寸": "6寸（10.1 x 15.2 厘米）",
  "身份证社保": "身份证社保（2.6 x 3.2 厘米）",
  "驾驶证": "驾驶证（2.2 x 3.2 厘米）",
  "日签": "日签（4.5 x 4.5 厘米）",
  "美签": "美签（5.1 x 5.1 厘米）",
  "研究生考试": "研究生考试（3.0 x 4.0 厘米）",
  "身份证电子": "身份证电子（358 x 441 像素 DPI: 350）",
  "普通话考试": "普通话考试（390 x 567 像素 DPI: 300）",
  "教师资格证": "教师资格证（480 x 640 像素 DPI: 300）",
  "护士资格证": "护士资格证（160 x 210 像素 DPI: 300）",
  "司法考试照": "司法考试照（413 x 626 像素 DPI: 300）",
  "执业医考照": "执业医考照（354 x 472 像素 DPI: 300）",
  "自定义尺寸": "自定义尺寸",
}
/** 相纸预设（厘米） */
const LAYOUT_PAPER_PRESET = {
  "5寸横版": { w: 12.7, h: 8.9 },
  "5寸竖版": { w: 8.9, h: 12.7 },
  "6寸横版": { w: 15.2, h: 10.2 },
  "6寸竖版": { w: 10.2, h: 15.2 },
  "A4横版": { w: 29.7, h: 21 },
  "A4竖版": { w: 21, h: 29.7 },
};

const _workflowSchemaCache = Object.create(null);

function loadWorkflowSchema(wf) {
  const file = resolveWorkflowApiPath(wf);
  if (!_workflowSchemaCache[file]) {
    _workflowSchemaCache[file] = JSON.parse(readFileSync(file, "utf8"));
  }
  return _workflowSchemaCache[file];
}

/**
 * 写入 workflow JSON：排版开/关与最终出图节点
 *
 * 关闭排版（默认）：323.开关=false，315 保持接 233（单张高清图）
 * 开启排版：323.开关=true，315.images=[70,0] 保存排版图；70/71 参数由 nodeInfoList 覆盖
 */
function applyLayoutWorkflowGraph(graph, layoutOn) {
  const switchId = ID_PHOTO_NODES.layoutGroupSwitch;
  const saveId = ID_PHOTO_NODES.saveImage;
  const layoutId = ID_PHOTO_NODES.layout;
  const layoutCropId = ID_PHOTO_NODES.layoutCrop;
  const switchNode = graph[switchId];
  const saveNode = graph[saveId];
  if (!switchNode) {
    throw new Error(`证件照工作流缺少排版组开关节点 ${switchId}`);
  }
  if (!saveNode?.inputs) {
    throw new Error(`证件照工作流缺少保存节点 ${saveId}`);
  }
  graph[switchId] = {
    ...switchNode,
    inputs: { "开关": true },
  };
  graph[saveId] = {
    ...saveNode,
    inputs: {
      ...saveNode.inputs,
      images: [layoutOn ? layoutId : layoutCropId, 0],
    },
  };
  return graph;
}

function assertWorkflowNodes(wf) {
  const schema = loadWorkflowSchema(wf);
  for (const [key, nodeId] of Object.entries(ID_PHOTO_NODES)) {
    if (!schema[nodeId]) {
      throw new Error(`证件照工作流缺少节点 ${nodeId}（${key}）`);
    }
  }
}

function collectVarMap({ body = {}, template } = {}) {
  const list = [
    ...normalizeVariables(body.prompt_variables),
    ...normalizeVariables(template?.prompt_variables),
  ];
  const map = Object.create(null);
  for (const { name, value } of list) {
    if (!name) continue;
    map[name] = value;
  }
  return map;
}

/** 解析「风格类型|提示词」或纯提示词（服装/发型模板常用） */
function parseStylePair(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return {};
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return {
      styleType: s.slice(0, pipe).trim(),
      promptText: s.slice(pipe + 1).trim(),
    };
  }
  if (/^\d+\.\s*.+_/.test(s)) {
    return { styleType: s };
  }
  return { promptText: s };
}

function pickSelector(vars, kind) {
  if (kind === "发型" && vars["发型选择"]) {
    const p = parseStylePair(vars["发型选择"]);
    if (p.styleType || p.promptText) return p;
    return { promptText: String(vars["发型选择"]).trim() };
  }
  const combined = vars[kind] ?? vars[`${kind}模板`];
  if (combined) {
    const p = parseStylePair(combined);
    if (p.styleType || p.promptText) return p;
  }
  const styleType =
    vars[`${kind}风格类型`] ??
    vars[`${kind}风格`] ??
    vars[`${kind}_style`];
  const promptText =
    vars[`${kind}提示词`] ??
    vars[`${kind}提示词输出`] ??
    vars[`${kind}_prompt`];
  return {
    styleType: styleType ? String(styleType).trim() : undefined,
    promptText: promptText ? String(promptText).trim() : undefined,
  };
}

/** 模版 prompt 替换变量并去掉 {发型选择}，供节点 284 服装提示词 */
function buildClothingPrompt(template) {
  if (!template?.prompt) return "";
  const vars = (template.prompt_variables || []).filter(
    (v) => v && v.name && v.name !== "发型选择",
  );
  let text = composePrompt(String(template.prompt), vars);
  return text.replace(/\{发型选择\}/g, "").trim();
}

function resolveBgHex(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return s;
  return ID_PHOTO_BG_HEX[s] ?? ID_PHOTO_BG_HEX[s.replace(/色$/, "")];
}

function parseTruthy(raw) {
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0) return false;
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (["1", "true", "yes", "on", "开启", "开", "是"].includes(s)) return true;
  if (["0", "false", "no", "off", "关闭", "关", "否"].includes(s)) return false;
  return undefined;
}

/**
 * 是否开启自动排版
 * 优先级：prompt_variables「自动排版」> body.enable_layout > classify.enable_layout
 */
function resolveLayoutEnabled({ body, classify, vars }) {
  const fromVar = parseTruthy(vars["自动排版"] ?? vars["排版"]);
  if (fromVar !== undefined) return fromVar;
  const fromBody = parseTruthy(body.enable_layout ?? body.layout_enabled);
  if (fromBody !== undefined) return fromBody;
  const fromClassify = parseTruthy(classify?.enable_layout);
  if (fromClassify !== undefined) return fromClassify;
  return false;
}

/** 解析相纸宽高（厘米）：预设名或 12.7x8.9 等形式 */
function parsePaperCm(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (LAYOUT_PAPER_PRESET[s]) return LAYOUT_PAPER_PRESET[s];
  const m = s.match(/^([\d.]+)\s*[xX×*,，]\s*([\d.]+)/);
  if (m) {
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
      return { w, h };
    }
  }
  return null;
}

function resolvePaperSize({ body, classify, vars }) {
  const raw =
    vars["相纸尺寸"] ??
    vars["相纸大小"] ??
    body.paper_size ??
    body.layout_paper_size;
  let paper = parsePaperCm(raw);
  if (!paper) {
    const w = Number(body.paper_width ?? body.layout_paper_width ?? classify?.layout_paper_width);
    const h = Number(body.paper_height ?? body.layout_paper_height ?? classify?.layout_paper_height);
    if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
      paper = { w, h };
    }
  }
  return paper ?? { w: 12.7, h: 8.9 };
}

function resolveLayoutPhotoPatch({ body, classify, vars }) {
  const key = String(vars["照片尺寸"] ?? "").trim();
  const value = LAYOUT_PHOTO_PRESET[key] ?? LAYOUT_PHOTO_PRESET["1寸"];
  const customValue = "自定义尺寸";
  const cropPatch = { 预设尺寸: value };
  if (value !== customValue) {
    return cropPatch;
  }

  cropPatch["预设尺寸"] = customValue;
  // 获得单位（默认为像素）
  const unit = value.match(/厘米|像素/)?.[0] ?? "像素";
  cropPatch["单位"] = unit;
  // 获得分辨率
  const dpi = value.match(/DPI[:：]?\s*(\d+)/i)?.[1];
  // 获得尺寸
  const sizes = value.match(/([\d.]+)\s*[xX×*,，]\s*([\d.]+)/) ?? [];
  const w = Number(body.output_width ?? sizes[1] ?? classify?.output_width);
  const h = Number(body.output_height ?? sizes[2] ?? classify?.output_height);
  const DPI = Number(body.output_dpi ?? dpi ?? classify?.output_dpi);
  if (Number.isFinite(w) && w > 0) cropPatch["自定义宽"] = w;
  if (Number.isFinite(h) && h > 0) cropPatch["自定义高"] = h;
  if (Number.isFinite(DPI) && DPI > 0) cropPatch.DPI = DPI;
  return cropPatch;
}

/**
 * @param {object} data - generate 入参（body、template、classify、seed 等）
 * @param {object} wf - runninghub 工作流配置（含 path）
 * @returns {{ patches: Record<string, Record<string, unknown>>, layoutOn: boolean }}
 */
export function buildIdPhotoNodePatches(data, wf) {
  assertWorkflowNodes(wf);

  const { body = {}, template, classify, seed } = data;
  const vars = collectVarMap({ body, template });
  const N = ID_PHOTO_NODES;
  const patches = {};

  const set = (nodeId, inputs) => {
    patches[nodeId] = { ...(patches[nodeId] || {}), ...inputs };
  };

  const hair = pickSelector(vars, "发型");
  let cloth = pickSelector(vars, "服装");
  const clothingFromTemplate = buildClothingPrompt(template);
  if (!cloth.styleType && !cloth.promptText && clothingFromTemplate) {
    cloth = { promptText: clothingFromTemplate };
  }

  if (hair.styleType || hair.promptText) {
    set(N.hairstyle, {
      ...(hair.styleType ? { 风格类型: hair.styleType } : {}),
      ...(hair.promptText ? { 提示词输出: hair.promptText } : {}),
    });
  }
  if (cloth.styleType || cloth.promptText) {
    set(N.clothing, {
      ...(cloth.styleType ? { 风格类型: cloth.styleType } : {}),
      ...(cloth.promptText ? { 提示词输出: cloth.promptText } : {}),
    });
  }

  const bgRaw = vars["背景颜色"] ?? vars["背景色"] ?? vars["background"];
  const bgHex = resolveBgHex(bgRaw);
  if (bgHex) {
    set(N.bgPicker, { 模式: "纯色", 主色: bgHex, 辅色: "#ffffff" });
    set(N.crop, { 自定义填充色: bgHex });
  }

  const hdSize = classify?.size_hd != null ? String(classify.size_hd) : "";
  const reqSize = body.size != null ? String(body.size) : "";
  set(N.hdToggle, { 开关: hdSize !== "" && reqSize !== "" && hdSize === reqSize });

  const enhanceOn =
    classify?.enable_enhance !== 0 && classify?.enable_enhance !== false;
  set(N.skinToggle, { 开关: !!enhanceOn });

  // 设置照片尺寸
  const cropPatch = resolveLayoutPhotoPatch({ body, classify, vars });
  set(N.layoutCrop, cropPatch);


  const userPrompt = String(body.prompt ?? "").trim();
  if (userPrompt) {
    set(N.extraText, { text: userPrompt });
  }

  set(N.seed, {
    seed: seed != null ? seed : randomInt(0, 281474976710655),
  });

  const layoutOn = resolveLayoutEnabled({ body, classify, vars });
  if (layoutOn) {
    const paper = resolvePaperSize({ body, classify, vars });
    set(N.layout, { "相纸宽": paper.w, "相纸高": paper.h });
    const layoutCrop = resolveLayoutPhotoPatch({ body, classify, vars });
    if (bgHex) {
      layoutCrop.自定义填充色 = bgHex;
    }
    set(N.layoutCrop, layoutCrop);
  }

  return { patches, layoutOn };
}

/** @param {Record<string, Record<string, unknown>>} patches */
export function patchesToNodeInfoList(patches) {
  const list = [];
  for (const [nodeId, inputs] of Object.entries(patches)) {
    for (const [fieldName, fieldValue] of Object.entries(inputs)) {
      list.push({ nodeId, fieldName, fieldValue });
    }
  }
  return list;
}

/**
 * 构建 RunningHub 创建任务请求体片段
 *
 * @param {object} data
 * @param {object} wf
 * @returns {{ nodeInfoList: Array<{nodeId:string,fieldName:string,fieldValue:unknown}>, workflow: string }}
 */
export function buildIdPhotoRunPayload(data, wf) {
  const images = data.images ?? data.body?.images ?? [];
  const imageUrl = images[0];
  if (!imageUrl || String(imageUrl).trim() === "") {
    throw new Error("证件照需要 body.images[0]：用户照片可访问 URL");
  }

  const { patches, layoutOn } = buildIdPhotoNodePatches(data, wf);
  const nodeInfoList = [
    {
      nodeId: ID_PHOTO_NODES.loadImage,
      fieldName: "image",
      fieldValue: String(imageUrl).trim(),
    },
    ...patchesToNodeInfoList(patches),
  ];

  const graph = JSON.parse(JSON.stringify(loadWorkflowSchema(wf)));
  applyLayoutWorkflowGraph(graph, layoutOn);

  return {
    nodeInfoList,
    workflow: JSON.stringify(graph),
  };
}
