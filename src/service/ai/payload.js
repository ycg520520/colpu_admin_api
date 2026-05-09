/**
 * @Author: colpu
 * @Date: 2026-05-01 11:08:00
 * @LastEditors: colpu
 * @LastEditTime: 2026-05-01 11:08:00
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { recordPayloads } from "../../models/ai/index.js";
export default class AiPayloadService extends Base {
  async upsertByTaskId(data) {
    const { task_id } = data || {};
    if (!task_id) {
      throw new Error('task_id is required');
    }
    const patch = {};
    for (const key of Object.keys(data || {})) {
      if (data[key] !== undefined) {
        patch[key] = data[key];
      }
    }
    const exists = await recordPayloads.findOne({
      where: { task_id },
    });
    if (!exists) {
      return recordPayloads.create(patch);
    }
    return exists.update(patch);
  }

  findByTaskId(task_id) {
    return recordPayloads.findOne({
      where: { task_id },
      raw: true
    });
  }

  async updateProgressByTaskId(data) {
    const { task_id, progress = 0, status, message, is_real_progress = false } = data || {};
    if (!task_id) {
      throw new Error('task_id is required');
    }
    return this.upsertByTaskId({
      task_id,
      progress,
      status,
      message,
      is_real_progress,
    });
  }

  async getProgressByTaskId(task_id) {
    const row = await this.findByTaskId(task_id);
    if (!row) return null;
    return {
      task_id,
      progress: row.progress ?? 0,
      status: row.status || null,
      message: row.message || null,
      is_real_progress: !!row.is_real_progress,
      updated_at: row.updated_at,
    };
  }
}
