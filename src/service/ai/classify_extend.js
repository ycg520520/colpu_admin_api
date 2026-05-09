/**
 * @Author: colpu
 * @Date: 2026-04-30 13:05:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-30 16:00:16
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { classifyExtend, classify } from "../../models/ai/index.js";
import { category, sysDb } from "../../models/sys/index.js";
import { Op, QueryTypes, col } from "sequelize";
export default class ClassifyExtendService extends Base {
  all() {
    const where = {
      status: true,
    };
    return classifyExtend.findAll({
      where,
      include: [{
        model: classify,
        nested: false,
        as: 'c',
        attributes: [] // 不需要分类表的字段
      }],
      attributes: {
        // 将关联表的字段“提升”到主表，并重命名为你想要的字段名
        include: [
          [col('c.name'), 'name'],// c是belongsTo关联的别名
          [col('c.model'), 'model'], // 与 records.model、classify.model 一致
          // 如果需要更多字段，继续添加： [col('c.otherField'), 'otherAlias']
        ]
      },
      raw: true
    })
  }
  async findOne(id) {
    const res = await classifyExtend.findByPk(id, { raw: true });
    if (!res) {
      throw new Error(`分类扩展ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { name } = data;
    const existing = await classifyExtend.findOne({
      where: {
        name
      },
    });
    if (existing) {
      throw new Error(`分类扩展${name}已存在`);
    }
    return classifyExtend.create(data);
  }
  async update(data) {
    const id = data.id;
    delete data.id;
    const res = await classifyExtend.findByPk(id);

    if (!res) {
      throw new Error(`分类扩展ID：${id}不存在`);
    }
    return res.update(data);
  }
  async delete(id) {
    const res = await classifyExtend.findByPk(id);
    if (!res) {
      throw new Error(`分类扩展ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
