/**
 * @Author: colpu
 * @Date: 2026-05-30 11:00:04
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-15 11:45:01
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { generatePrompt } from "../utils.js";

/**
 * RunningHub 生成入口
 *
 * classify.model = runninghub:{workflowId}
 * 参数映射见 workflows/idPhoto.js（nodeInfoList + workflow JSON）
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
    ...prompt,
    body,
    model,
    classify,
  });
  return returnResult({ uid, model, images, id, input: { body, prompt }, output });
}
