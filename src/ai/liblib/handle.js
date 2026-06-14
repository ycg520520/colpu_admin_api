import { generatePrompt } from "../utils.js";

/**
 * Liblib 通道：classify.model 为 `liblib:{templateUuid}`，配置见 liblib/config.js
 * @param {import("./client.js").default} client
 * @param {object} data
 * @param {Function} returnResult - ai/index 的 returnResult
 */
export default async function liblibHandle(client, data, returnResult) {
  const { body, uid, classify } = data;
  const model = String(classify.model).trim();
  const { id, images = [] } = body;
  if (!client) throw new Error("LiblibAI 未配置（请在 .config.js 配置 liblibOption）");
  const prompt = generatePrompt({ classify, body });
  const output = await client.generate({
    ...body,
    body,
    model,
    prompt,
    classify,
    repair_hint: body.repair_hint,
  });
  return returnResult({ uid, model, images, id, input: { body, prompt }, output });
}
