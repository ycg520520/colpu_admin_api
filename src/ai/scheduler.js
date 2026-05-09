/**
 * @Author: colpu
 * @Date: 2026-05-08 16:47:30
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-09 11:45:47
 *
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */


/**
 * 轮询调度：**动态槽数** = `min(maxConcurrency, 当前所需)`。
 * - 所需：`entries.size >0` 时为 `entries.size`；仅余 inFlight 排空时为 `1`。
 * - 每槽：抢占 id → tick → onAfterTick → 释放 inFlight → interval → 再抢；`add` 增大队列时会 `queueMicrotask` 补槽至目标。
 *
 * @typedef {(raw: unknown, id: string, scheduler: PollScheduler) => Promise<void>} onAfterTick
 * @typedef {Object} PollSchedulerOptions
 * @property {number} [interval=2000] - 同一槽位两次 tick 之间的间隔（ms）
 * @property {number} [maxConcurrency=5] - 并发上限；非法/非正时默认 5
 * @property {number} [idleSleepMs=30] - 暂无可抢任务时短眠（ms）
 * @property {onAfterTick} onAfterTick
 */
export default class PollScheduler {
  /**
   * @param {object} opts
   * @param {number} [opts.interval=2000]
   * @param {number} [opts.maxConcurrency=5]
   * @param {number} [opts.idleSleepMs=30]
   * @param {onAfterTick} opts.onAfterTick
   */
  constructor({ interval = 2000, maxConcurrency = 5, idleSleepMs = 30, onAfterTick } = {}) {
    if (typeof onAfterTick !== "function") {
      throw new Error("PollScheduler: onAfterTick(raw, id, scheduler) is required");
    }
    this.interval = interval;
    const mc = Number(maxConcurrency);
    this._poolSize =
      Number.isFinite(mc) && mc > 0 ? Math.floor(mc) : 5;
    this._idleSleepMs = Number.isFinite(Number(idleSleepMs)) && Number(idleSleepMs) >= 0
      ? Math.floor(Number(idleSleepMs))
      : 30;
    /** @type {onAfterTick} */
    this.onAfterTick = onAfterTick;
    /** @type {Map<string, { tick: (id: string) => Promise<unknown> }>} */
    this.entries = new Map();
    /** 正在执行 tick（已抢占、尚未释放）的 id */
    this._inFlight = new Set();
    /** 公平抢占：轮转起点 */
    this._rr = 0;
    this._looping = false;
    /** 当前存活的 _slotWorker 协程数 */
    this._activeWorkers = 0;
  }

  /**
   * 当前应起的槽位数：不超过上限，且至少 1（只要有活）；全无则 0。
   */
  _desiredWorkerCount() {
    const pending = this.entries.size;
    const flying = this._inFlight.size;
    if (pending === 0 && flying === 0) return 0;
    if (pending === 0) return Math.min(this._poolSize, 1);
    return Math.min(this._poolSize, Math.max(1, pending));
  }

  /**
   * @param {Array<{ id: string, tick: (id: string) => Promise<unknown> }>} items
   */
  add(items) {
    for (const item of items) {
      const { id, tick } = item;
      if (!id || typeof tick !== "function") {
        throw new Error("PollScheduler.add: id and tick are required");
      }
      this.entries.set(id, { tick });
    }
    this._ensurePolling();
  }

  /** @param {string} id */
  remove(id) {
    this.entries.delete(id);
  }

  clear() {
    this.entries.clear();
    this._inFlight.clear();
    this._rr = 0;
  }

  pollSize() {
    return this.entries.size;
  }

  stop() {
    this._looping = false;
  }

  _ensurePolling() {
    if (!this._looping) {
      this._looping = true;
    }
    this._spawnWorkersToTarget();
  }

  _spawnWorkersToTarget() {
    if (!this._looping) return;
    const want = this._desiredWorkerCount();
    while (this._looping && want > 0 && this._activeWorkers < want) {
      this._activeWorkers++;
      const p = this._slotWorker();
      p.finally(() => {
        this._activeWorkers--;
        if (!this._looping) return;
        if (this._activeWorkers === 0 && this.entries.size === 0 && this._inFlight.size === 0) {
          this._looping = false;
          return;
        }
        if (this._looping && this._desiredWorkerCount() > this._activeWorkers) {
          queueMicrotask(() => this._spawnWorkersToTarget());
        }
      });
    }
  }

  /**
   * @returns {{ id: string, tick: (id: string) => Promise<unknown> } | null}
   */
  _tryAcquireJob() {
    const ids = [...this.entries.keys()].sort();
    const n = ids.length;
    if (n === 0) return null;
    for (let k = 0; k < n; k++) {
      const idx = (this._rr + k) % n;
      const id = ids[idx];
      if (this._inFlight.has(id)) continue;
      const entry = this.entries.get(id);
      if (!entry) continue;
      this._inFlight.add(id);
      this._rr = (idx + 1) % n;
      return { id, tick: entry.tick };
    }
    return null;
  }

  /**
   * @param {string} id
   * @param {(id: string) => Promise<unknown>} tick
   */
  async _runOneTick(id, tick) {
    return Promise.resolve()
      .then(() => tick(id))
      .then((raw) => this.onAfterTick(raw, id, this))
      .catch((err) => {
        console.error(`PollScheduler tick error id=${id}`, err);
      });
  }

  async _slotWorker() {
    while (this._looping) {
      const job = this._tryAcquireJob();
      if (!job) {
        if (this.entries.size === 0 && this._inFlight.size === 0) break;
        await new Promise((r) => setTimeout(r, this._idleSleepMs));
        continue;
      }
      const { id, tick } = job;
      try {
        await this._runOneTick(id, tick);
      } finally {
        this._inFlight.delete(id);
      }
      if (!this._looping) break;
      if (this.interval > 0) {
        await new Promise((r) => setTimeout(r, this.interval));
      }
    }
  }
}
