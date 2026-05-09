/**
 * AI 任务轮询：薄适配层 —— 组合「无依赖的 PollScheduler」与业务（进度平滑、HTTP 回写、SDK **`clients`**）。
 * 默认导出为 **`singleton(TaskPoller)`**：**`new TaskPoller(appConfig)`** 在进程内始终得到同一实例；仅**首次**会执行构造函数（故 `appConfig` 以首次传入为准）。`updateTaskUrl` 等见 **`src/config/index.js`**。
 * **`clients`**（见 **`./clients.js`** 的 `createClients`）既供 **`add` 轮询**（按 **`model`** → `clientKeyByModel` 选 SDK），也可作为 **`generate` 的 `tasker`**，与 **`add` 共用同一批 SDK 实例**。
 *
 * - 调度内核：./scheduler.js（零 fetcher / 零 SDK）
 * - SDK 实例：`./clients.js`（`createClients`）
 */
import fetcher from "./fetcher.js";
import PollScheduler from "./scheduler.js";
import { createClients } from "./clients.js";
import { clientKeyByModel, progressStatus } from "./utils.js";
import { singleton } from "../../utils/index.js";

export { createClients, PollScheduler };

class TaskPoller {
  progressMap = Object.create(null);
  runningTicks = Object.create(null);
  interval = 2000;
  updateTaskUrl = "";
  /**
   * 与 `generate(data.tasker)` 所需形状一致：`{ viapi, bailian?, comfyui? }`
   * @type {ReturnType<typeof createClients>|null}
   */
  clients = null;
  /** @type {PollScheduler|null} */
  _scheduler = null;

  /**
   * @param {Object} config - 应用层 config（与 `src/config/index.js` 导出一致）
   * @param {string} config.updateTaskUrl - 回写任务进度的 HTTP 地址
   * @param {object} config.ali.default - OSS / Viapi 等所需的 ossOption
   * @param {object} [config.aikeys] - 含 `ali_bailian` 等，用于 `createClients`
   * @param {object} [config.comfyOption] - ComfyUI（含 `baseUrl` 等）
   * @param {object} [config.poll] - `interval` / `maxConcurrency` / `idleSleepMs` 可选
   */
  constructor(config) {
    if (!config?.updateTaskUrl) {
      throw new Error("updateTaskUrl is required（请在 app config 中配置，见 src/config/index.js）");
    }
    const ossOption = config.ali?.default;
    if (!ossOption) {
      throw new Error("config.ali.default is required for TaskPoller（ossOption）");
    }
    const clients = createClients({
      aikeys: config.aikeys,
      ossOption,
      comfyOption: config.comfyOption,
    });
    if (clients == null || typeof clients !== "object") {
      throw new Error("createClients returned invalid clients");
    }
    if (this._scheduler) {
      this._scheduler.stop();
      this._scheduler.clear();
    }
    this.updateTaskUrl = config.updateTaskUrl;
    this.interval = config.poll?.interval ?? 2000;
    this.clients = clients;

    const interval = this.interval;
    const maxConcurrency =
      config.poll?.maxConcurrency !== undefined && config.poll?.maxConcurrency !== null
        ? config.poll.maxConcurrency
        : 5;
    const idleSleepMs =
      config.poll?.idleSleepMs !== undefined && config.poll?.idleSleepMs !== null
        ? config.poll.idleSleepMs
        : 30;
    this._scheduler = new PollScheduler({
      interval,
      maxConcurrency,
      idleSleepMs,
      onAfterTick: async (raw, id, sched) => {
        if (raw == null || typeof raw !== "object") return;
        const merged = { ...raw, task_id: raw.task_id ?? id };
        const patched = this.withProgress(merged);
        await this.pushTaskUpdate(patched);
        const st = patched?.task_status;
        if (st === "SUCCEEDED" || st === "FAILED") {
          sched.remove(id);
          delete this.progressMap[id];
          delete this.runningTicks[id];
        }
      },
    });
  }

  /**
   * @param {Array<{ task_id: string, model: string }>} tasks - `model` 同 `records.model` / classify.model，经 `clientKeyByModel` 选 `clients` 并调用 `getResult`
   */
  async add(tasks) {
    if (!this._scheduler) {
      throw new Error(
        "TaskPoller 未就绪：请先 new TaskPoller(appConfig) 再 add(tasks)",
      );
    }
    const items = [];
    for (const t of tasks) {
      const { task_id, model } = t;
      if (!task_id) {
        throw new Error("TaskPoller.add: task_id is required");
      }
      if (model == null || String(model).trim() === "") {
        throw new Error(
          "TaskPoller.add: model is required（与 records.model 一致）",
        );
      }
      const clientKey = clientKeyByModel(model);
      const client = this.clients?.[clientKey];
      if (!client || typeof client.getResult !== "function") {
        throw new Error(
          `TaskPoller.add: no client.getResult for model "${model}" → "${clientKey}"`,
        );
      }
      const tick = (id) => client.getResult(id);
      if (this.progressMap[task_id] === undefined) {
        this.progressMap[task_id] = 0;
      }
      if (this.runningTicks[task_id] === undefined) {
        this.runningTicks[task_id] = 0;
      }
      items.push({ id: task_id, tick });
    }
    this._scheduler.add(items);
  }

  stop() {
    this._scheduler?.stop();
  }

  pollSize() {
    return this._scheduler?.pollSize() ?? 0;
  }

  withProgress(data) {
    const { task_status, task_id } = data || {};
    const prev = this.progressMap[task_id] || 0;
    let progress = prev;
    let message = "等待中";

    switch (task_status) {
      case "PENDING":
        progress = Math.max(prev, 10);
        message = "任务排队中";
        this.runningTicks[task_id] = 0;
        break;
      case "RUNNING":
        this.runningTicks[task_id] = (this.runningTicks[task_id] || 0) + 1;
        {
          const step = this.runningTicks[task_id] > 6 ? 3 : 7;
          progress = Math.min(Math.max(prev, 25) + step, 85);
        }
        if (progress < 45) {
          message = "生成中";
        } else if (progress < 70) {
          message = "细节增强中";
        } else {
          message = "结果整理中";
        }
        break;
      case "SUCCEEDED":
        progress = 100;
        message = "任务完成";
        this.runningTicks[task_id] = 0;
        break;
      case "FAILED":
        progress = 100;
        message = "任务失败";
        this.runningTicks[task_id] = 0;
        break;
      case "CANCELED":
        progress = 100;
        message = "任务已取消";
        this.runningTicks[task_id] = 0;
        break;
      case "UNKNOWN":
        progress = Math.max(prev, 0);
        message = "等待中";
        break;
      default:
        progress = Math.max(prev, 0);
        message = "等待中";
    }

    const status = progressStatus(task_status);
    this.progressMap[task_id] = progress;
    return { ...data, progress, status, message, is_real_progress: false };
  }

  async pushTaskUpdate(data) {
    const { task_id } = data || {};
    try {
      await fetcher(this.updateTaskUrl, data, {
        method: "PUT",
        headers: {
          "X-Verify-Skip": "true",
        },
      }).then((res) => {
        console.log(`Task ${task_id} updated successfully:`, res);
      }).catch((err) => {
        console.log(`Task ${task_id} updated error:`, err);
      });
      const st = data?.task_status;
      const known = new Set(["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED", "UNKNOWN"]);
      if (st != null && String(st) && !known.has(String(st))) {
        console.error(`Unknown task status: ${st}`);
      }
    } catch (error) {
      console.error(`Failed to update task ${task_id}:`, error);
    }
  }
}

export default singleton(TaskPoller);
