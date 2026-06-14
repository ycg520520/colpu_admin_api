/**
 * LiblibAI 开放平台 HTTP 客户端
 * 工作流配置：./config.js（model 为 liblib:{templateUuid}）
 */
import fetcher from "../fetcher.js";
import { buildSignedUrl } from "./sign.js";
import { loadLiblibConfig } from "./config.js";
import buildImageRepairParams from "./workflows/imageRepairParams.js";

const PATH_COMFY_APP = "/api/generate/comfyui/app";
const PATH_COMFY_STATUS = "/api/generate/comfy/status";

const STATUS_MAP = {
  1: "PENDING",
  2: "RUNNING",
  3: "RUNNING",
  4: "RUNNING",
  5: "SUCCEEDED",
  6: "FAILED",
};

export default class LiblibAI {
  constructor(option) {
    const accessKey = option?.accessKey || process.env.LIBLIB_ACCESS_KEY;
    const secretKey = option?.secretKey || process.env.LIBLIB_SECRET_KEY;
    if (!accessKey || !secretKey) {
      throw new Error("LiblibAI accessKey / secretKey 未配置");
    }
    const ossClient = option.ossClient;
    if (!ossClient) {
      throw new Error('缺少ossClient实例，请确保在createClients时正确传入ossOption参数');
    }
    const liblibConfig = loadLiblibConfig(option.workflows);
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseUrl = String(option.baseUrl || liblibConfig.baseUrl).replace(/\/$/, "");
    this.workflows = liblibConfig.workflows;
    this.ossClient = ossClient;
  }

  /** model `liblib:485582355f1b4e07a6a962380bae2292` → workflowUuid */
  workflowUuidFromModel(model) {
    const m = String(model ?? "").trim();
    if (!m.startsWith("liblib:")) return "";
    return m.slice("liblib:".length).trim();
  }
  /**
   * @param {string} model liblib:{workflowUuid}
   * @returns {{ name: string, templateUuid: string, workflowUuid: string, defaultTemplateImage?: string, nodes: object }}
   */
  resolveWorkflow(model) {
    const key = this.workflowUuidFromModel(model);
    if (!key) {
      throw new Error("无法解析 Liblib 工作流（model 须为 liblib:{workflowUuid}）");
    }
    if (this.workflows[key]) {
      return this.workflows[key];
    }
    throw new Error(
      `Liblib 工作流未配置: ${key}（见 src/ai/liblib/config.js）`,
    );
  }

  async _request(uri, body) {
    const url = buildSignedUrl(this.baseUrl, uri, this.accessKey, this.secretKey);
    const res = await fetcher(url, body, { method: "POST" });
    if (typeof res === "string") {
      throw new Error(`Liblib API 错误: ${res.slice(0, 400)}`);
    }
    if (res == null || typeof res !== "object") {
      throw new Error("Liblib API 返回格式异常");
    }
    const code = res.code;
    if (code !== 0 && code !== "0" && code !== 200 && code !== "200") {
      const msg = res.msg || res.message || `Liblib API 失败(code=${code})`;
      if (/template not found/i.test(msg)) {
        throw new Error(
          `${msg}。请在 Liblib 工作流 API 页复制正确的 templateUuid，并写入 .config.js → liblibOption.workflows`,
        );
      }
      throw new Error(msg);
    }
    return res.data ?? res;
  }
  async generate(data) {
    // const workflows = this.resolveWorkflow(data.model);
    const workflows = this.resolveWorkflow("liblib:485582355f1b4e07a6a962380bae2292");
    const { templateUuid } = workflows;
    const generateParams =  buildImageRepairParams(data, workflows);
    const out = await this._request(PATH_COMFY_APP, { templateUuid, generateParams });
    const generateUuid = out?.generateUuid;
    if (!generateUuid) {
      throw new Error("Liblib 提交任务失败：未返回 generateUuid");
    }
    return {
      task_id: generateUuid,
      task_status: "PENDING",
      output: { generateUuid, templateUuid, provider: "liblib" },
      model: data.model,
    };
  }

  _mapStatus(generateStatus) {
    return STATUS_MAP[Number(generateStatus)] || "RUNNING";
  }

  _collectImageUrls(data) {
    const list = data?.images;
    if (!Array.isArray(list)) return [];
    return list
      .map((item) => item?.imageUrl)
      .filter((u) => typeof u === "string" && u.trim());
  }

  async getResult(task_id) {
    const data = await this._request(PATH_COMFY_STATUS, { generateUuid: task_id });
    const task_status = this._mapStatus(data?.generateStatus);
    const output = {
      generateStatus: data?.generateStatus,
      percentCompleted: data?.percentCompleted,
      generateMsg: data?.generateMsg,
      provider: "liblib",
    };

    if (task_status === "FAILED") {
      return {
        task_id,
        task_status: "FAILED",
        output: { ...output, reason: data?.generateMsg || "Liblib 任务失败" },
        images: [],
      };
    }

    if (task_status !== "SUCCEEDED") {
      return { task_id, task_status, output, images: [] };
    }

    const urls = this._collectImageUrls(data);
    if (!urls.length) {
      return {
        task_id,
        task_status: "FAILED",
        output: { ...output, reason: "任务成功但无可用出图（可能仍在审核）" },
        images: [],
      };
    }

    const images = await this.ossClient.uploads(urls);
    return { task_id, task_status: "SUCCEEDED", output, images };
  }
}
