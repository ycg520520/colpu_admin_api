/**
 * RunningHub OpenAPI 客户端（证件照等工作流）
 *
 * API 说明（apiType=5）：
 * - 创建任务：POST /openapi/v2/run/workflow/{workflowId}，Header: Authorization: Bearer {apiKey}
 *   Body: { nodeInfoList, workflow? }，workflow 为 ComfyUI API 图 JSON 字符串
 * - 查询结果：POST /task/openapi/outputs，Body: { apiKey, taskId }
 *   code: 0 成功，804 执行中，813 排队，805 失败
 *
 * LoadImage 的 image 字段可直接传公网可访问 URL，无需先 upload。
 *
 * @see https://www.runninghub.cn/call-api/api-detail/2030897076795609089?apiType=5
 */
import fetcher from "../fetcher.js";
import { loadRunningHubConfig } from "./config.js";
import idPhoto from "./workflows/idPhoto.js";
import photoRepair from "./workflows/photoRepair.js";
import { composeImageUrls } from "../utils.js";

const TASK_CREATE = "/task/openapi/create";
const TASK_QUERY = "/openapi/v2/query";

export default class RunningHub {
  constructor(option) {
    const apiKey = option?.apiKey || process.env.RUNNINGHUB_API_KEY;
    if (!apiKey) {
      throw new Error("RunningHub apiKey 未配置");
    }
    const ossClient = option.ossClient;
    if (!ossClient) {
      throw new Error('缺少ossClient实例，请确保在createClients时正确传入ossOption参数');
    }
    const cfg = loadRunningHubConfig(option.workflows);
    this.apiKey = apiKey;
    this.baseUrl = String(option.baseUrl || cfg.baseUrl).replace(/\/$/, "");
    this.workflows = cfg.workflows;
    this.webhookUrl = option.webhookUrl;
    this.ossClient = ossClient;
  }
  /**
   * 从 classify.model 解析工作流键
   * @param {string} model 形如 runninghub:2030897076795609089
   */
  runningHubKeyFromModel(model) {
    const m = String(model ?? "").trim();
    if (!m.startsWith("runninghub:")) return "";
    return m.slice("runninghub:".length).trim();
  }

  /**
   * @param {string} model runninghub:{workflowId}
   * @returns {{ name?: string, workflowId: string, path?: string }}
   */
  resolveWorkflow(model) {
    const key = this.runningHubKeyFromModel(model);
    if (!key) {
      throw new Error("无法解析 RunningHub 工作流（model 须为 runninghub:{workflowId}）");
    }
    if (this.workflows[key]) {
      return this.workflows[key];
    }
    throw new Error(
      `RunningHub 工作流未配置: ${key}（见 src/ai/runninghub/config.js）`,
    );
  }

  _parseJsonResponse(res) {
    if (typeof res === "string") {
      throw new Error(`RunningHub 错误: ${res.slice(0, 400)}`);
    }
    if (res == null || typeof res !== "object") {
      throw new Error(`RunningHub 返回格式异常`);
    }
    return res;
  }

  async _request(uri, body, options = {}) {
    const url = `${this.baseUrl}${uri}`;
    const res = await fetcher(url, body, {
      method: "POST",
      ...options,
      headers: { Host: "www.runninghub.cn", Authorization: `Bearer ${this.apiKey}` },
    });
    return this._parseJsonResponse(res);
  }

  _buildRunPayload(wf, data) {
    console.log(wf, data)
    switch (wf.workflowId) {
      case "1946963516941328385":
        return photoRepair(data, wf);
      case "2030897076795609089":
        return idPhoto(data, wf);
      default:
        throw new Error(`RunningHub 工作流类型未定义: ${wf.type}`);
    }
  }

  _mapCreateStatus(status) {
    const s = String(status ?? "").toUpperCase();
    if (s === "FAILED") return "FAILED";
    if (s === "RUNNING") return "RUNNING";
    if (s === "SUCCESS" || s === "SUCCEEDED") return "SUCCEEDED";
    return "PENDING";
  }

  _mapCreateResponse(res, workflowId, model) {
    const { msg, code, data = {} } = res;
    if (code === 0) {
      const { taskId, taskStatus, promptTips } = data;
      // 成功创建任务，继续处理
      return {
        task_id: String(taskId),
        task_status: this._mapCreateStatus(taskStatus),
        output: {
          taskId,
          workflowId,
          provider: "runninghub",
          promptTips: promptTips,
          rh_status: taskStatus,
        },
        model,
      };
    }
    throw new Error(`RunningHub 创建任务失败(code=${code},msg=${msg})`,
    );
  }

  async generate(data) {
    const wf = this.resolveWorkflow(data.model);
    const { nodeInfoList, workflow } = this._buildRunPayload(wf, data);
    const workflowId = wf.workflowId;
    const res = await this._request(TASK_CREATE, {
      apiKey: this.apiKey,
      workflowId,
      nodeInfoList,
      workflow,
      webhookUrl: this.webhookUrl,
      instanceType: "plus",
    });
    return this._mapCreateResponse(res, workflowId, data.model);
  }

  _mapOutputsResponse(res) {
    const { status, ...reset } = res;
    const output = {
      provider: "runninghub",
      ...reset
    };
    if (status === "SUCCESS") {
      const urls = composeImageUrls(reset.results);
      return { task_status: "SUCCEEDED", output, images: urls, raw_urls: urls };
    }
    return { task_status: status, output, images: [] };
  }

  async getResult(task_id) {
    const res = await this._request(TASK_QUERY, {
      taskId: task_id,
    });
    const mapped = this._mapOutputsResponse(res);
    if (mapped.task_status === "SUCCEEDED" && mapped.raw_urls?.length) {
      const images = await this.ossClient.uploads(mapped.raw_urls);
      const { raw_urls, ...rest } = mapped;
      return { ...rest, task_id, images };
    }
    return { ...mapped, task_id };
  }
}
