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
 * @param {object} schema - 工作流图
 * @param {{
 *   prompt?: string,
 *   promptPositive?: string,
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
    promptPositive,
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
  if (!first || String(first).trim() === "") {
    throw new Error("image_repair 需要 body.images[0] 为可访问的原图 URL");
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

  const main = promptPositive ?? prompt;
  if (main !== undefined && String(main).trim() !== "") {
    pb = pb.input("repair_text", String(main).trim());
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
    throw new Error("image_repair 需要有效提示词：请配置 classify/body 的 prompt 或 prompt_positive");
  }

  const uploaded = await ins.uploadImage(String(first).trim());
  const name =
    uploaded?.info?.filename ?? uploaded?.info?.name ?? uploaded?.filename;
  if (!name) throw new Error("ComfyUI uploadImage 未返回文件名（info.filename / info.name）");

  const load = graph["131"];
  if (!load?.inputs || typeof load.inputs !== "object") {
    throw new Error("image_repair 工作流缺少节点 131 LoadImage");
  }
  graph["131"] = { ...load, inputs: { ...load.inputs, image: name } };

  return graph;
}
