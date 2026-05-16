/**
 * ComfyUI：@saintno/comfyui-sdk `ComfyApi`（appendPrompt / getHistory / uploadImage）+ 本地工作流 JSON；文生图用 PromptBuilder；出图 URL 转存 OSS。
 * 工作流为 API Format（与 Comfy 界面「Save (API Format)」一致），JSON 放在本目录 `workflows/`。
 */
import { ComfyApi } from "@saintno/comfyui-sdk";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AliOSS from "../alioss.js";
import textToImage from "./textToImage.js";
import imageRepair from "./imageRepair.js";

export const WORKFLOWS = new Set(["text_to_image", "image_repair"]);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default class ComfyUI {
  constructor(option) {
    if (!option?.baseUrl) throw new Error("ComfyUI baseUrl is required");
    if (!option?.ossOption) throw new Error("ComfyUI ossOption is required");
    this.baseUrl = String(option.baseUrl).replace(/\/$/, "");
    this.ossClient = new AliOSS(option.ossOption);
    /** 用于把 `template.img_src` 相对路径拼成 Comfy 可下载的绝对 URL（一般为 OSS/CDN 根） */
    this.assetsBaseUrl = String(option.assetsBaseUrl ?? option.publicAssetsBase ?? "").replace(/\/$/, "");
    this._credentials = option.credentials;
    /** @type {ComfyApi | null} */
    this._api = null;
    /** @type {Promise<void> | null} */
    this._apiReady = null;
  }

  async _ensureApi() {
    if (this._api) return this._api;
    if (!this._apiReady) {
      this._apiReady = (async () => {
        const api = await new ComfyApi(this.baseUrl, "node-id", {
          // credentials: this._credentials,
        });
        await api.init(10, 2000).waitForReady().catch(err => {
          console.error("ComfyAPI init failed", err);
          throw new Error(`ComfyAPI init failed: ${err?.message || err}`);
        });
        this._api = api;
      })();
    }
    await this._apiReady;
    return this._api;
  }

  /**
   * model 以 `comfyui:` 开头，后为工作流文件名（不含 .json），如 `comfyui:my_workflow`。
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
    const file = path.join(__dirname, "workflows", `${workflow}.json`);
    if (!existsSync(file)) {
      throw new Error(`Workflow not found: ${workflow} (place API JSON under src/ai/comfyui/workflows/)`);
    }
    return JSON.parse(readFileSync(file, "utf8"));
  }

  /**
   * 将可访问的图片 URL 下载后交给 SDK {@link ComfyApi.uploadImage}。
   * @param {string} url 可访问图片地址
   * @returns {Promise<{ info: { name?: string, filename?: string }, url: string }>}
   */
  async uploadImage(url) {
    let filename = "api_input.png";
    try {
      filename = path.basename(new URL(url).pathname) || filename;
    } catch {
      /* 非标准 URL 时用默认名 */
    }
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const api = await this._ensureApi();
    const out = await api.uploadImage(buf, filename, { override: true }).catch(err => {
      console.error(`ComfyUI uploadImage failed for URL: ${url}`, err);
      throw new Error(`ComfyUI uploadImage failed: ${err?.message || err}`);
    });
    if (!out?.info) {
      throw new Error("ComfyUI uploadImage failed");
    }
    return out;
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

  async getResult(task_id) {
    const api = await this._ensureApi();
    let entry;
    try {
      entry = await api.getHistory(task_id);
    } catch (err) {
      // TaskPoller 忽略非 object 的 raw，返回 null 会导致永不回写进度
      console.error(`ComfyUI getHistory failed task_id=${task_id}`, err);
      return {
        task_id,
        task_status: "RUNNING",
        output: { history_error: String(err?.message || err) },
        images: [],
      };
    }
    if (entry == null) {
      return {
        task_id,
        task_status: "RUNNING",
        output: {},
        images: [],
      };
    }
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

  async composeWorkflow(workflow, options) {
    const schema = this.loadWorkflow(workflow);
    switch (workflow) {
      case "text_to_image":
        return await textToImage(schema, options, this);
      case "image_repair":
        return await imageRepair(schema, options, this);
      default:
        throw new Error(`Unsupported workflow: ${workflow}`);
    }
  }

  /**
   * 文生图 / 修图等：compose 后按需注入 LoadImage，再 appendPrompt。
   * @param {{ model: string, images?: string[], prompt?: string }} data
   */
  async generate(data) {
    const { model } = data;
    const workflow = this.workflowName(model);
    if (!workflow) {
      throw new Error("无法解析ComfyUI工作流");
    }
    if (!WORKFLOWS.has(workflow)) {
      throw new Error(`未注册的工作流: ${workflow}（支持: ${[...WORKFLOWS].join(", ")}）`);
    }
    const graph = await this.composeWorkflow(workflow, data);
    const api = await this._ensureApi();
    const res = await api.appendPrompt(graph);
    if (!res?.prompt_id) {
      throw new Error("ComfyUI appendPrompt failed: no prompt_id in response");
    }
    const { prompt_id } = res;
    return {
      task_id: prompt_id,
      task_status: "PENDING",
      output: { prompt_id, workflow },
      model,
    };
  }
}
