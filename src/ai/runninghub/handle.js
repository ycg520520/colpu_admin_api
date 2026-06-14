import { generatePrompt } from "../utils.js";

/**
 * RunningHub 生成入口
 *
 * classify.model = runninghub:{workflowId}
 * 参数映射见 workflows/idPhotoParams.js（nodeInfoList + workflow JSON）
 */
export default async function runningHubHandle(client, data, returnResult) {
  const { body, uid, classify } = data;
  const model = String(classify.model).trim();
  const { id, images = [] } = body;
  if (!client) {
    throw new Error("RunningHub 未配置（请在 .config.js 配置 runninghubOption.apiKey）");
  }
  const prompt = generatePrompt({ classify, body });
  const output = await client.generate({
    ...body,
    body,
    model,
    prompt,
    classify,
  });
  return returnResult({ uid, model, images, id, input: { body, prompt }, output });
}
