import { randomInt } from "crypto";
import { PromptBuilder } from "@saintno/comfyui-sdk";

const INPUT_KEYS = ["positive", "width", "height", "batch", "seed", "steps", "cfg"];

/**
 * 使用 PromptBuilder 注入 text_to_image 的常用参数。
 * @param {object} schema - 工作流图
 * @param {{
 *   prompt?: string,
 *   promptPositive?: string,
 *   promptNegative?: string（内置图无负向 CLIP 时不生效；负向文案请用 clipTextByNodeId 指向具体节点）,
 *   clipTextByNodeId?: Record<string, string>,
 *   width?: number,
 *   height?: number,
 *   seed?: number,
 *   steps?: number,
 *   cfg?: number,
 *   batchSize?: number,
 * }} opts
 * @param {ComfyUI} ins - ComfyUI 实例
 */
export default function textToImagePrompt(schema, opts, ins) {
  const {
    prompt,
    promptPositive,
    clipTextByNodeId,
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

  const posText = promptPositive ?? prompt;
  if (posText !== undefined && String(posText).trim() !== "") {
    pb = pb.input("positive", String(posText).trim());
  }
  if (width != null) pb = pb.input("width", width);
  if (height != null) pb = pb.input("height", height);
  if (batchSize != null) pb = pb.input("batch", batchSize);
  if (seed != null) pb = pb.input("seed", seed);
  if (steps != null) pb = pb.input("steps", steps);
  if (cfg != null) pb = pb.input("cfg", cfg);

  if (clipTextByNodeId && typeof clipTextByNodeId === "object") {
    for (const [nodeId, text] of Object.entries(clipTextByNodeId)) {
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
