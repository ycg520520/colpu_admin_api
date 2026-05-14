import { randomInt } from "crypto";
import { PromptBuilder } from "@saintno/comfyui-sdk";

const INPUT_KEYS = [
  "repair_text",
  "hint_text",
  "seed",
  "steps",
  "cfg",
  "denoise",
  "guidance",
  "scale_length",
];

/**
 * image_repair 工作流参数注入（API 格式图，见 workflows/image_repair.json）。
 * 双图：`images[0]` → 节点 131，`images[1]` → 节点 132；两次 ins.uploadImage。
 * @param {object} schema - 工作流图
 * @param {{
 *   prompt?: string,
 *   repair_hint?: string,
 *   seed?: number,
 *   steps?: number,
 *   cfg?: number,
 *   denoise?: number,
 *   guidance?: number,
 *   scale_to_length?: number,
 *   images?: string[],
 * }} opts
 * @param {{ uploadImage: (url: string) => Promise<{ info?: { filename?: string, name?: string } }> }} ins - ComfyUI 实例
 */
export default async function imageRepair(schema, opts, ins) {
  const {
    prompt,
    repair_hint,
    seed,
    steps,
    cfg,
    denoise,
    guidance,
    scale_to_length,
    images = [],
  } = opts;

  const first = images[0];
  const second = images[1];
  if (!first || String(first).trim() === "") {
    throw new Error("image_repair 需要 body.images[0]：老照片可访问 URL");
  }
  if (!second || String(second).trim() === "") {
    throw new Error("image_repair 需要 body.images[1]：修复模版图可访问 URL");
  }

  let pb = new PromptBuilder(schema, INPUT_KEYS, [])
    .setInputNode("repair_text", "95.inputs.text")
    .setInputNode("hint_text", "100.inputs.text")
    .setInputNode("seed", "101.inputs.seed")
    .setInputNode("steps", "101.inputs.steps")
    .setInputNode("cfg", "101.inputs.cfg")
    .setInputNode("denoise", "101.inputs.denoise")
    .setInputNode("guidance", "99.inputs.guidance")
    .setInputNode("scale_length", "106.inputs.scale_to_length");

  if (prompt) {
    pb = pb.input("repair_text", String(prompt).trim());
  }
  if (repair_hint !== undefined && String(repair_hint).trim() !== "") {
    pb = pb.input("hint_text", String(repair_hint).trim());
  }
  if (seed != null) pb = pb.input("seed", seed);
  if (steps != null) pb = pb.input("steps", steps);
  if (cfg != null) pb = pb.input("cfg", cfg);
  if (denoise != null) pb = pb.input("denoise", denoise);
  if (guidance != null) pb = pb.input("guidance", guidance);
  if (scale_to_length != null) pb = pb.input("scale_length", scale_to_length);

  const graph = JSON.parse(JSON.stringify(pb.workflow));

  if (scale_to_length != null && graph["107"]?.inputs) {
    graph["107"] = {
      ...graph["107"],
      inputs: { ...graph["107"].inputs, scale_to_length: scale_to_length },
    };
  }

  if (seed == null) {
    const node = graph["101"];
    if (node?.inputs && typeof node.inputs === "object") {
      graph["101"] = {
        ...node,
        inputs: { ...node.inputs, seed: randomInt(0, 281474976710655) },
      };
    }
  }

  const text = graph["95"]?.inputs?.text;
  if (!String(text ?? "").trim()) {
    throw new Error("image_repair：无有效提示词（classify / prompt / template）");
  }

  const uploaded = await ins.uploadImage(String(first).trim());
  const name = uploaded?.info?.filename ?? uploaded?.info?.name ?? uploaded?.filename;
  if (!name) throw new Error("老照片 uploadImage 未返回文件名（info.filename / info.name）");

  const uploadedTpl = await ins.uploadImage(String(second).trim());
  const nameTpl =
    uploadedTpl?.info?.filename ?? uploadedTpl?.info?.name ?? uploadedTpl?.filename;
  if (!nameTpl) throw new Error("模版图 uploadImage 未返回文件名（info.filename / info.name）");

  const load = graph["131"];
  if (!load?.inputs || typeof load.inputs !== "object") {
    throw new Error("image_repair 工作流缺少节点 131 LoadImage（老照片）");
  }
  graph["131"] = { ...load, inputs: { ...load.inputs, image: name } };

  const loadTpl = graph["132"];
  if (!loadTpl?.inputs || typeof loadTpl.inputs !== "object") {
    throw new Error("image_repair 工作流缺少节点 132 LoadImage（修复模版）");
  }
  graph["132"] = { ...loadTpl, inputs: { ...loadTpl.inputs, image: nameTpl } };

  return graph;
}
