/**
 * @Author: colpu
 * @Date: 2026-02-10 16:17:00
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-19 09:44:17
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { records } from "../../models/ai/index.js";
import { Op, literal } from "sequelize";
const RECORD_CREATE_KEYS = new Set([
  "uid",
  "classify_id",
  "model",
  "task_id",
  "original_images",
  "images",
  "task_status",
  "status",
]);

export default class AiRecordService extends Base {
  /**
   * 创建一条任务记录 + record_payloads，并按需把异步任务加入 TaskPoller 单例。
   * @param {object} options
   * @param {object} options.record - 白名单字段见 create()
   * @param {object} [options.payload] - 除 task_id、record_id 外的 record_payloads 字段（input / output / progress 等）
   */
  async createRecordWithPayload(data) {
    const { payload, ...reset } = data;
    const task_id = reset.task_id;
    if (!task_id) {
      throw new Error("createRecordWithPayload: task_id is required");
    }
    const createRes = await this.create(reset);
    await this.service.ai.payload.upsertByTaskId({
      ...payload,
      task_id,
      record_id: createRes.id,
    });
    return createRes;
  }

  create(data) {
    const row = {};
    for (const key of Object.keys(data || {})) {
      if (RECORD_CREATE_KEYS.has(key)) {
        row[key] = data[key];
      }
    }
    return records.create(row);
  }

  async getTasks(statusIn = ["PENDING", "RUNNING"]) {
    const rows = await records.findAll({
      where: {
        task_status: {
          [Op.in]: statusIn
        },
        created_at: {
          [Op.gte]: literal("NOW() - INTERVAL 1 DAY")
        }
      },
      attributes: ["task_id", "model"],
      raw: true
    });
    return rows.map((r) => ({
      task_id: r.task_id,
      model: r.model,
    }));
  }

  async update(data) {
    const { task_id, task_status, images } = data;
    const res = await records.findOne({ where: { task_id } });
    if (!res) {
      throw new Error(`任务task_id：${task_id}不存在`);
    }
    const patch = {};
    if (task_status !== undefined) patch.task_status = task_status;
    if (images !== undefined) patch.images = images;
    return res.update(patch);
  }

  list(params) {
    const { uid, page = 1, pageSize = 20 } = params;
    const where = {
      uid,
      created_at: {
        [Op.gte]: literal("NOW() - INTERVAL 30 DAY")
      }
    };
    return records.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ["id", "original_images", "images", "created_at", "task_status", "classify_id", "model", "task_id"],
      raw: true
    }).then((res) => this.composePaginationData(res, page, pageSize));
  }

  findOne(id) {
    return records.findOne({
      where: { id },
      attributes: ["id", "original_images", "images", "created_at", "task_status", "task_id", "classify_id", "model"],
      raw: true
    });
  }

  findOneByTaskId(task_id) {
    return records.findOne({
      where: { task_id },
      attributes: ["task_id", "task_status", "updated_at"],
      raw: true
    });
  }
}
