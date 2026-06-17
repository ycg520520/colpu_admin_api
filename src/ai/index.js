import { VIAPI_FUN } from './viapi.js';
import { BAILIAN_MODELS } from "./bailian.js";
import {
  generatePrompt,
  fixSrc,
  getSize,
  firstImage,
  progressStatus,
} from "./utils.js";
import liblibHandle from "./liblib/handle.js";
import runningHubHandle from "./runninghub/handle.js";
/**
 * @param {object} clients
 * @param {object} data
 * @param {object} data.body
 * @param {string|number|undefined} data.uid
 * @param {object} data.classify — classify.findOne 的平铺结果（含id、model、prompt、prompt_variables、size等）
 * @param {object} [data.ctx] — 控制器 ctx，供扩展使用
 * @returns {Promise<{ record: object, payload: object}|null }>}
 */
export default async function generate(clients, data) {
  const { classify, body } = data;
  let model = String(classify.model).trim();
  console.log("model==>1", model);
  // 做特殊处理，可调用不同模型
  if (["photoRepair"].includes(model)) {
    // 对model进行处理
    const templates = (body.templates || [{}])[0];
    const template = templates.template || {}
    model = template.name;
    classify.model = model;
    console.log("model==>2", model);
  }
  if (model.startsWith("runninghub")) {
    return await runningHubHandle(clients.runninghub, data, returnResult);
  }
  if (model.startsWith("liblib")) {
    return await liblibHandle(clients.liblib, data, returnResult);
  }
  if (model.startsWith("comfyui")) {
    return await comfyUIHandle(clients.comfyui, data);
  }
  if (VIAPI_FUN.has(model)) {
    return viapiHandle(clients.viapi, data);
  }
  if (Object.keys(BAILIAN_MODELS).includes(model)) {
    return bailianHandle(clients.bailian, data);
  }
  throw new Error(
    `未找到正确的model: ${model}`,
  );

}
function progressInfo(status) {
  return {
    progress: status === "SUCCEEDED" ? 100 : 5,
    status: progressStatus(status),
    message: status === "SUCCEEDED" ? "任务完成" : "任务排队中",
  }
}

function outputFrom(taskStatus, detail) {
  const o = { task_status: taskStatus };
  if (detail != null && typeof detail === "object" && !Array.isArray(detail)) {
    Object.assign(o, detail);
  } else if (detail !== undefined) {
    o.detail = detail;
  }
  return o;
}

function returnResult({ uid, model, images, id, output, input = {} }) {
  const { task_id, task_status, record_id } = output;
  const classify_id = id;
  const original_images = images.map((image) => fixSrc(image));
  return {
    uid,
    model,
    original_images,
    classify_id,
    task_status,
    task_id,
    images: output.images ?? [],
    payload: {
      task_id,
      record_id,
      input: {
        ...input,
        model,
        classify_id,
      },
      output: outputFrom(task_status, output.output),
      ...progressInfo(task_status),
    },
  };
}
async function bailianHandle(client, data) {
  const { body, uid, classify } = data;
  const { images = [], id } = body;
  const model = String(classify.model).trim();
  if (!client) throw new Error("百炼未配置");
  if (!images.length) throw new Error("缺少图片参数 images");

  const size = getSize({ body, classify });
  const prompt = generatePrompt({ classify, body });
  const output = await client.generate({
    model,
    images,
    prompt,
    parameters: { size },
  });
  return returnResult({ uid, model, images, id, output, input: { prompt, size, body } });
}

async function viapiHandle(client, data) {
  const { body, uid, classify } = data;
  const model = String(classify.model).trim();
  const { images = [], id } = body;
  const imageUrl = firstImage(images);
  if (!imageUrl) throw new Error("缺少图片参数 images[0]");
  const required = { uid, model, images, id };
  const input = (scaleKey = 'scale') => ({
    [scaleKey]: body[scaleKey] ?? 2,
    outputFormat: body.outputFormat ?? "png",
    outputQuality: body.outputQuality ?? 95,
  })
  if (model === "generateSuperResolutionImage") {
    if (body.size === '2K') {
      body.scale = 4
    }
    const output = await client.generateSuperResolutionImage({
      imageUrl,
      ...input(),
      userData: body.userData ?? "",
    });
    return returnResult({
      ...required,
      input: { ...input(), body },
      output,
    });
  }

  if (model === "makeSuperResolutionImage") {
    if (body.size === '2K') {
      body.upscaleFactor = 4
    }
    const output = await client.makeSuperResolutionImage({
      url: imageUrl,
      ...input("upscaleFactor"),
    });
    return returnResult({
      ...required,
      input: { ...input("upscaleFactor"), body },
      output,
    });
  }

  if (model === "colorizeImage") {
    const output = await client.colorizeImage({ imageUrl });
    return returnResult({ ...required, input: { body }, output });
  }

  if (model === "enhanceImageColor" || model === "faceEnhance") {
    const mode = body.mode ?? "quality";
    const output = await client.enhanceImageColor({
      imageUrl,
      mode: mode === "fast" ? "LogC" : "HDR",
    });
    return returnResult({ ...required, input: { mode, body }, output });
  }
  throw new Error(`未支持的 viapi model: ${model}`);
}
async function comfyUIHandle(client, data) {
  const { body, uid, classify } = data;
  const model = String(classify.model).trim();
  const { id, images = [] } = body;
  if (!client) throw new Error("ComfyUI 未配置");
  const prompt = generatePrompt({ classify, body });
  const output = await client.generate({ ...body, model, prompt, classify });
  return returnResult({ uid, model, images, id, input: { body }, output, is_real_progress: true });
}
