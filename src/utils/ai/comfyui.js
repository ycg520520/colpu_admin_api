/**
 * ComfyUI HTTP API（单机）：/upload/image → /prompt → 轮询 /history/{prompt_id} → /view 取图并上传 OSS
 * 工作流为 API Format（与 Comfy 界面「Save (API Format)」一致），见 src/config/workflows/
 */
import { randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import path from "path";
import fetcher from "./fetcher.js";
import AliOSS from "./alioss.js";

export default class ComfyUI {
  constructor(option) {
    if (!option?.baseUrl) throw new Error("ComfyUI baseUrl is required");
    if (!option?.ossOption) throw new Error("ComfyUI ossOption is required");
    this.baseUrl = String(option.baseUrl).replace(/\/$/, "");
    this.ossClient = new AliOSS(option.ossOption);
  }

  /**
   * @function workflowName
   * @description
   * 解析 ComfyUI 工作流名称：
   * model以 "comfyui:" 开头，后面直接跟工作流名称，如 "comfyui:my_workflow"。
   * @param {string} model - 模型键，可能为 "comfyui:xxx"。
   * @returns {string} 解析得到的 ComfyUI 工作流名称。
   * @throws {Error} 如果无法解析出有效的工作流名称，则抛出错误。
   * @example
   * const model = "comfyui:my_workflow";
   * console.log(workflowName(model)); // 输出: "my_workflow"
   */
  workflowName(model) {
    if (model.startsWith("comfyui:")) {
      return model.slice("comfyui:".length).trim();
    }
    return "";
  }

  loadWorkflow(workflow) {
    if (!/^[a-zA-Z0-9_-]+$/.test(workflow)) {
      throw new Error("Invalid workflow");
    }
    const file = path.join(process.cwd(), "src/config/workflows", `${workflow}.json`);
    if (!existsSync(file)) {
      throw new Error(`Workflow not found: ${workflow} (place API JSON under src/config/workflows/)`);
    }
    return JSON.parse(readFileSync(file, "utf8"));
  }

  injectUploadImage(schema, image) {
    const graph = JSON.parse(JSON.stringify(schema));
    for (const id of Object.keys(graph)) {
      const node = graph[id];
      if (node?.class_type === "LoadImage" && node.inputs && typeof node.inputs === "object") {
        graph[id] = {
          ...node,
          inputs: { ...node.inputs, image },
        };
        return graph;
      }
    }
    throw new Error("Workflow has no LoadImage node; add LoadImage or export API format from ComfyUI");
  }
  /**
   * @function uploadImageToComfy
   * @description
   * 将可访问的图片 URL 上传到 ComfyUI 的 /upload/image 接口，获取上传后的图片信息。
   * - 输入 URL 可能是外链或 CDN 地址，函数会先下载图片内容，再以 multipart/form-data 格式上传到 ComfyUI。
   * - 上传成功后，ComfyUI 会返回一个 JSON 对象，其中包含上传图片的相关信息，如 name、url 等。
   * @param {string} url 可访问图片地址
   * @returns {Promise<{ name: string, url: string }>} 上传后的图片信息
   */
  async uploadImageToComfy(url) {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const form = new FormData();
    form.append("image", new Blob([buf]), "api_input.png");
    form.append("type", "input");
    form.append("overwrite", "true");
    const up = await fetch(`${this.baseUrl}/upload/image`, { method: "POST", body: form });
    const text = await up.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`ComfyUI /upload/image invalid JSON: ${text.slice(0, 200)}`);
    }
    if (!up.ok) {
      throw new Error(`ComfyUI /upload/image failed: ${up.status} ${JSON.stringify(json)}`);
    }
    if (!json.name) {
      throw new Error("ComfyUI /upload/image did not return name");
    }
    return json;
  }

  async queuePrompt(prompt) {
    const client_id = randomUUID();
    const res = await fetcher(`${this.baseUrl}/prompt`,
      { prompt, client_id },
      { headers: {}, method: "POST" },
    );
    if (typeof res === "string") {
      throw new Error(`ComfyUI /prompt failed: ${res.slice(0, 800)}`);
    }
    if (res.error) {
      throw new Error(typeof res.error === "string" ? res.error : JSON.stringify(res.error));
    }
    if (res.node_errors && Object.keys(res.node_errors).length) {
      throw new Error(JSON.stringify(res.node_errors));
    }
    if (!res.prompt_id) {
      throw new Error("ComfyUI /prompt did not return prompt_id");
    }
    return res;
  }

  pickHistoryEntry(data, task_id) {
    if (!data || typeof data !== "object") return null;
    if (data[task_id]) return data[task_id];
    if (data.outputs !== undefined || data.status !== undefined) return data;
    const keys = Object.keys(data);
    if (keys.length === 1) return data[keys[0]];
    return null;
  }

  buildViewUrls(entry) {
    const urls = [];
    const outputs = entry?.outputs || {};
    for (const nodeId of Object.keys(outputs)) {
      const out = outputs[nodeId];
      if (!out?.images?.length) continue;
      for (const img of out.images) {
        const filename = img.filename;
        if (!filename) continue;
        const u = new URL(`${this.baseUrl}/view`);
        u.searchParams.set("filename", filename);
        u.searchParams.set("type", img.type || "output");
        if (img.subfolder) u.searchParams.set("subfolder", img.subfolder);
        urls.push(u.toString());
      }
    }
    return urls;
  }

  mapHistoryToTask(task_id, output) {
    if (!output || (typeof output === "object" && Object.keys(output).length === 0)) {
      return {
        task_id,
        task_status: "RUNNING",
        output: {},
        images: [],
      };
    }
    const messages = output.status?.messages;
    if (Array.isArray(messages) && messages.length) {
      const last = messages[messages.length - 1];
      if (last?.type === "error" || output.status?.status_str === "error") {
        return {
          task_id,
          task_status: "FAILED",
          output: { messages, entry: output },
          images: [],
        };
      }
    }
    if (!output.outputs || Object.keys(output.outputs).length === 0) {
      return {
        task_id,
        task_status: "RUNNING",
        output,
        images: [],
      };
    }
    return {
      task_id,
      task_status: "SUCCEEDED",
      output,
      images: [],
    };
  }

  async fetchHistory(task_id) {
    const url = `${this.baseUrl}/history/${encodeURIComponent(task_id)}`;
    const r = await fetch(url, { method: "GET" });
    const text = await r.text();
    if (!r.ok) {
      return null;
    }
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return null;
    }
  }

  async getResult(task_id) {
    const raw = await this.fetchHistory(task_id);
    if (raw == null) {
      return {
        task_id,
        task_status: "RUNNING",
        output: {},
        images: [],
      };
    }
    const entry = this.pickHistoryEntry(raw, task_id);
    const mapped = this.mapHistoryToTask(task_id, entry);
    if (mapped.task_status !== "SUCCEEDED") {
      return mapped;
    }
    const viewUrls = this.buildViewUrls(entry);
    if (!viewUrls.length) {
      return {
        task_id: task_id,
        task_status: "FAILED",
        output: { ...mapped.output, reason: "No output images in history" },
        images: [],
      };
    }
    const images = await this.ossClient.uploads(viewUrls);
    return { ...mapped, images };
  }

  /**
   * @function generate
   * @description
   * 生成接口，接收工作流名称、图片 URL 和提示词，执行 ComfyUI 工作流并返回任务信息。
   * - 输入参数包括 workflow（工作流名称）、images（图片 URL 数组）和 prompt（提示词字符串）。
   * - 函数会先将输入图片上传到 ComfyUI，然后将提示词发送到 /prompt 接口排队执行工作流。
   * - 返回值包含 task_id、task_status、output（原始输出数据）和 images（最终输出图片 URL 数组）。
   * @param {{ workflow: string, images: string[], prompt: string }} data
   * @returns {Promise<{ task_id: string, task_status: string, output: object, images: string[] }>} 任务信息和输出结果
   * @example
   * const data = {
   *   workflow: "my_workflow",
   *   images: ["https://example.com/input.jpg"],
   *   prompt: "请生成一张512x512的red,blue图片",
   * };
   * const result = await generate(data);
   * console.log(result);
   */
  async generate(data) {
    const { model, images, prompt } = data;
    if (!images?.length) {
      throw new Error("images[0] is required");
    }
    const workflow = this.workflowName(model);
    if (!workflow) {
      throw new Error("无法解析ComfyUI工作流");
    }
    const schema = this.loadWorkflow(workflow);
    const uploaded = await this.uploadImageToComfy(images[0]);
    const graph = this.injectUploadImage(schema, uploaded.name);
    const { prompt_id } = await this.queuePrompt(graph);
    return {
      task_id: prompt_id,
      task_status: "PENDING",
      output: { prompt_id, workflow },
      model,
    };
  }
}
