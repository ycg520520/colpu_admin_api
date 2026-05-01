/**
 * @Author: colpu
 * @Date: 2026-02-10 16:17:00
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-28 14:51:12
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { aiDb, records } from "../../models/ai/index.js";
import { Op, QueryTypes, literal } from "sequelize";
export default class AiRecordService extends Base {
  create(data) {
    return records.create(data);
  }
  // 状态有："PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED", "UNKNOWN"
  findOne(task_id, statusIn = ["SUCCEEDED"]) {
    return records.findOne({
      where: {
        task_id,
        task_status: {
          [Op.in]: statusIn
        }
      },
      raw: true
    });
  }
  findAll(uid, attributes = ['task_id'],) {
    return records.findAll({
      where: {
        uid
      },
      attributes,
      raw: true
    });
  }
  getTasks(statusIn = ['PENDING', 'RUNNING']) {
    return records.findAll({
      where: {
        task_status: {
          [Op.in]: statusIn
        },
        created_at: {
          [Op.gte]: literal('NOW() - INTERVAL 1 DAY')  // MySQL 精确到秒
        }
      },
      attributes: ['task_id', 'task_type'],
      raw: true
    })
  }
  async update(data) {
    const { task_id, model, ...reset } = data
    const res = await records.findOne({ where: { task_id } });
    if (!res) {
      throw new Error(`任务task_id：${task_id}不存在`);
    }
    return res.update({...reset, action: model});
  }

  list(params) {
    const { uid, page = 1, pageSize = 20 } = params;
    const where = {
      uid,
      created_at: {
        [Op.gte]: literal('NOW() - INTERVAL 30 DAY')  // MySQL 精确到秒
      }
    };
    return records.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'original_images', 'images', 'created_at', 'task_status', 'model'],
      raw: true
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  findOne(id) {
    return records.findOne({
      where: {
        id
      },
      attributes: ['id', 'original_images', 'images', 'created_at', 'task_status', 'task_id', 'model'],
      raw: true
    })
  }
}
