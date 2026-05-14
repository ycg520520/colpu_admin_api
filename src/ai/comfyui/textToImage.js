import { randomInt } from "crypto";
import { PromptBuilder } from "@saintno/comfyui-sdk";

const INPUT_KEYS = ["positive", "width", "height", "batch", "seed", "steps", "cfg"];

/**
 * @function textToImagePrompt
 * @description
 * 为 Comfy 工作流 `text_to_image`（API 格式）用 PromptBuilder 写入常用参数。
 * - 正向 CLIP 文本：节点 `104:90`，取值顺序为 opt.prompt → opt.prompt_positive；其中 **prompt 建议为服务端 `generatePrompt` 的返回值**，与百炼等通道文案来源一致。
 * - 画幅与批量：`104:91` 的 width、height、batch_size。
 * - 采样：`104:92` 的 seed、steps、cfg；未传 seed 时在图副本上写入随机 seed。
 * - 可按节点 id 覆盖其它 CLIP：`clip_text_by_nodeid` 键为节点 id，值为 `CLIPTextEncode.inputs.text`。
 * - 负向：本工作流若无对应节点，`prompt_negative` 不生效；需负向时请用 clip_text_by_nodeid 指向具体节点。
 * @param {object} schema - 已 parse 的 `workflows/text_to_image.json` 图对象。
 * @param {{
 *   prompt?: string,
 *   prompt_negative?: string（内置图无负向 CLIP 时不生效；负向文案请用 clip_text_by_nodeid 指向具体节点）,
 *   clip_text_by_nodeid?: Record<string, string>,
 *   width?: number,
 *   height?: number,
 *   seed?: number,
 *   steps?: number,
 *   cfg?: number,
 *   batchSize?: number,
 * }} opt - 与 `generate({ ...body, model, prompt })` 中 body 扩展字段一致。
 * @param {import("./index.js").default} ins - ComfyUI 实例（当前实现未使用，保留与 imageRepair 等签名一致）。
 * @returns {Record<string, unknown>} 可直接 appendPrompt 的 graph。
 * @example
 * textToImagePrompt(schema, { prompt: "...", width: 1024, height: 1024 }, comfy);
 */
export default function textToImagePrompt(schema, opts, ins) {
  const {
    prompt,
    prompt_negative,
    clip_text_by_nodeid,
    width,
    height,
    seed,
    steps,
    cfg,
    batchSize,
  } = opts;

  let pb = new PromptBuilder(schema, INPUT_KEYS, [])
    .setInputNode("positive", "104:90.inputs.text")
    .setInputNode("width", "104:91.inputs.width")
    .setInputNode("height", "104:91.inputs.height")
    .setInputNode("batch", "104:91.inputs.batch_size")
    .setInputNode("seed", "104:92.inputs.seed")
    .setInputNode("steps", "104:92.inputs.steps")
    .setInputNode("cfg", "104:92.inputs.cfg");

  if (prompt) {
    pb = pb.input("positive", String(prompt).trim());
  }
  if (width != null) pb = pb.input("width", width);
  if (height != null) pb = pb.input("height", height);
  if (batchSize != null) pb = pb.input("batch", batchSize);
  if (seed != null) pb = pb.input("seed", seed);
  if (steps != null) pb = pb.input("steps", steps);
  if (cfg != null) pb = pb.input("cfg", cfg);

  if (clip_text_by_nodeid && typeof clip_text_by_nodeid === "object") {
    for (const [nodeId, text] of Object.entries(clip_text_by_nodeid)) {
      pb = pb.inputRaw(`${nodeId}.inputs.text`, String(text));
    }
  }

  const graph = JSON.parse(JSON.stringify(pb.workflow));

  if (seed == null) {
    const node = graph["104:92"];
    if (node?.inputs && typeof node.inputs === "object") {
      graph["104:92"] = {
        ...node,
        inputs: { ...node.inputs, seed: randomInt(0, 281474976710655) },
      };
    }
  }

  const clipText = graph["104:90"]?.inputs?.text;
  if (!String(clipText ?? "").trim()) {
    throw new Error("Workflow has no CLIPTextEncode text; set prompt / promptPositive or clipTextByNodeId");
  }

  return graph;
}
