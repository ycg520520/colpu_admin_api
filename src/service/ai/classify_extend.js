/**
 * @Author: colpu
 * @Date: 2026-04-30 13:05:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-26 15:41:53
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { classifyExtend, classify } from "../../models/ai/index.js";
import { category, sysDb } from "../../models/sys/index.js";
import { Op, QueryTypes, col } from "sequelize";
function formatRow(row) {
  if (!row) return row;
  const r = typeof row.toJSON === "function" ? row.toJSON() : row;
  const c = r.c || r.Classify || {};
  return {
    ...r,
    c: undefined,
    Classify: undefined,
    classify_name: c.name,
    classify_model: c.model,
  };
}

export default class ClassifyExtendService extends Base {
  list(params) {
    const {
      page = 1,
      pageSize = 20,
      classify_id,
      status,
      feature,
    } = params;
    const where = {};
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (classify_id !== undefined && classify_id !== "") {
      where.classify_id = Number(classify_id);
    }
    if (feature) {
      where.feature = { [Op.like]: `%${feature}%` };
    }

    return classifyExtend
      .findAndCountAll({
        where,
        include: [
          {
            model: classify,
            as: "c",
            attributes: ["id", "name", "model"],
            required: false,
          },
        ],
        order: [
          ["id", "DESC"],
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      .then((res) => ({
        rows: (res.rows || []).map(formatRow),
        count: res.count,
      }))
      .then((res) => this.composePaginationData(res, page, pageSize));
  }

  all() {
    const where = {
      status: true,
    };
    return classifyExtend.findAll({
      where,
      order: [["sort_order", "DESC"]],
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
    const row = await classifyExtend.findByPk(id, {
      include: [
        {
          model: classify,
          as: "c",
          attributes: ["id", "name", "model"],
        },
      ],
    });
    if (!row) {
      throw Object.assign(new Error(`分类扩展ID：${id}不存在`), {
        status: 404,
      });
    }
    return formatRow(row);
  }

  async create(data) {
    const classifyRow = await classify.findByPk(data.classify_id);
    if (!classifyRow) {
      throw Object.assign(new Error("关联的 AI 项目不存在"), { status: 400 });
    }
    const row = await classifyExtend.create(data);
    return this.findOne(row.id);
  }

  async update(data) {
    const { id, ...rest } = data;
    const row = await classifyExtend.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`分类扩展ID：${id}不存在`), {
        status: 404,
      });
    }
    if (rest.classify_id !== undefined) {
      const classifyRow = await classify.findByPk(rest.classify_id);
      if (!classifyRow) {
        throw Object.assign(new Error("关联的 AI 项目不存在"), { status: 400 });
      }
    }
    await row.update(rest);
    return this.findOne(id);
  }

  async delete(id) {
    const row = await classifyExtend.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`分类扩展ID：${id}不存在`), {
        status: 404,
      });
    }
    await row.update({ status: 0 });
    return true;
  }
}
