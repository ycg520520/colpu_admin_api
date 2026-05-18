/**
 * @Author: colpu
 * @Date: 2025-11-22 20:33:37
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-18 16:24:59
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { classify, classifyTemplate } from "../../models/ai/index.js";
import { category, sysDb } from "../../models/sys/index.js";
import { Op, QueryTypes } from "sequelize";
export default class ClassifyService extends Base {
  all(params) {
    const { name } = params;
    const where = {
      status: true,
    };
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return classify.findAll({
      where,
      order: [["sort_order", "DESC"]],
      attributes: ['id', 'name', "description", 'icon', 'is_hot', 'is_tip', 'disabled'],
      raw: true
    })
  }
  async findOne(id) {
    const res = await classify.findByPk(id, { raw: true });
    if (!res) {
      const err = new Error(`分类ID：${id}不存在`);
      err.status = 404;
      throw err;
    }
    return res;
  }
  async create(data) {
    const { name } = data;
    const existing = await classify.findOne({
      where: {
        name
      },
    });
    if (existing) {
      throw new Error(`分类${name}已存在`);
    }
    return classify.create(data);
  }
  async update(data) {
    const id = data.id;
    delete data.id;
    const res = await classify.findByPk(id);

    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
    }
    return res.update(data);
  }
  async delete(id) {
    const res = await classify.findByPk(id);
    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
  async findOneById(id) {
    const res = await classify.findByPk(id);
    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
    }
    const templates = await res.getTemplates({
      attributes: ["id",
        "category_id",
        "name",
        "img_src",
        "img_width",
        "img_height",
        "line_art_src",
        "prompt",
        "prompt_variables",
        "status"],
      where: {
        status: true
      },
      joinTableAttributes: [], // 去掉关联表中的属性
      raw: true
    })
    const categoryIds = templates.map(item => item.category_id)
    let categories = [];
    if (categoryIds.length) {
      categories = await sysDb.query(`
      WITH RECURSIVE
      -- 查询祖先节点
      ancestors AS (
          SELECT id, parent_id, name, 1 AS depth
          FROM category
          WHERE id IN (:categoryIds)
          UNION ALL
          SELECT c.id, c.parent_id, c.name, a.depth + 1
          FROM category c
          INNER JOIN ancestors a ON c.id = a.parent_id
      ),
      -- 查询子孙节点
      descendants AS (
          SELECT id, parent_id, name, 1 AS depth
          FROM category
          WHERE id IN (:categoryIds)
          UNION ALL
          SELECT c.id, c.parent_id, c.name, d.depth + 1
          FROM category c
          INNER JOIN descendants d ON c.parent_id = d.id
      )
      -- SELECT id, parent_id, name, MIN(depth) AS depth
      SELECT id, parent_id, name
      FROM (
          SELECT * FROM ancestors
          UNION
          SELECT * FROM descendants
      ) AS combined
      GROUP BY id, parent_id, name
      -- ORDER BY depth, id
      ORDER BY id
    `, {
        replacements: { categoryIds },
        type: QueryTypes.SELECT
      }).then(res => this.utils.installTree(res, { key_fid: 'parent_id' }))
    }
    return {
      ...res.toJSON(),
      templates,
      categories,
    };
  }
}
