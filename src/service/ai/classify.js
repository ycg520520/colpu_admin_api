/**
 * @Author: colpu
 * @Date: 2025-11-22 20:33:37
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-13 23:31:19
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { classify, classifyTemplate, categoryTemplate, templateGroup } from "../../models/ai/index.js";
import { category, sysDb } from "../../models/sys/index.js";
import { Op, QueryTypes } from "sequelize";
export default class ClassifyService extends Base {
  async tree() {
    return classify.findAll({
      where: { status: 1 },
      attributes: ["id", "name"],
      order: [
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
  }
  async all() {
    return classify.findAll({
      where: {
        status: 1,
      },
      order: [["sort_order", "DESC"]],
      attributes: ['id', 'name', "description", 'icon', 'is_hot', 'is_tip', 'disabled'],
      raw: true
    })
  }

  list(params) {
    const {
      page = 1,
      pageSize = 20,
      name,
      status,
      disabled,
    } = params;
    const where = {};
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (disabled !== undefined && disabled !== "") {
      where.disabled = Number(disabled);
    }
    const orArr = [];
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } });
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }

    return classify
      .findAndCountAll({
        where,
        order: [
          ["sort_order", "DESC"],
          ["id", "ASC"],
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        raw: true,
      })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }

  async create(data) {
    const { group, ...reset } = data;
    return this.service.ai.classify.create(reset);
  }
  async update(data) {
    const { id, group, ...reset } = data;
    const res = await classify.findByPk(id);
    if (!res) {
      throw Object.assign(new Error(`分类ID：${id}不存在`), { status: 404 });
    }
    return res.update(reset);
  }
  async delete(id) {
    const res = await classify.findByPk(id);
    if (!res) {
      throw Object.assign(new Error(`分类ID：${id}不存在`), { status: 404 });
    }
    return res.update({ status: 0 });
  }
  getGroupIds(
    data,
    categoryId,
    isPush = false,
  ) {
    const map = {}
    const reslet = [];
    data.forEach((item) => {
      if (item?.children) {
        const flag = isPush ? true : item.id === categoryId;
        const ids = this.getGroupIds(item?.children, categoryId, flag);
        if (flag) {
          reslet.push(...ids);
        }
      }
      if (isPush) {
        reslet.push(item.id);
      }
    });
    return reslet;
  }
  async findOne(id) {
    const res = await classify.findByPk(id);
    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
    }
    const templates = await res.getTemplates({
      attributes: ["id",
        "name",
        "img_src",
        "img_width",
        "img_height",
        "line_art_src",
        "prompt",
        "prompt_variables",
        "status"
      ],
      where: {
        status: true
      },
      order: [['sort_order', 'DESC']],
      joinTableAttributes: [], // 去掉关联表中的属性
      raw: true
    })
    const templateIds = templates.map(item => item.id);

    // 2. 第二步：去另一个库批量查出这些模板对应的 category_id
    const relations = await categoryTemplate.findAll({
      where: {
        template_id: templateIds
      },
      attributes: ['template_id', 'category_id'],
      raw: true
    });
    const relationMap = new Map();
    const categoryIds = []
    relations.forEach(rel => {
      const templateId = rel.template_id;
      const categoryId = rel.category_id;
      categoryIds.push(categoryId);
      if (!relationMap.get(templateId)) {
        relationMap.set(templateId, []);
      }
      relationMap.get(templateId).push(categoryId)
    });
    templates.map(item => {
      const templateId = item.id;
      if (relationMap.get(templateId)) {
        item.category_id = relationMap.get(templateId)[0]
        item.category_ids = relationMap.get(templateId)
      }
    })
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
    const group = await templateGroup.findAll({
      where: { classify_id: id },
      attributes: ['id', 'name', 'title', "category_ids"], raw: true
    });
    return {
      ...res.toJSON(),
      templates,
      categories,
      group,
    };
  }
}
