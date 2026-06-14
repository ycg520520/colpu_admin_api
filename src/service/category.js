/**
 * @Author: colpu
 * @Date: 2025-12-10 17:25:08
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-10 14:05:45
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { category, categoryType } from "../models/sys/index.js";
import { Op, } from "sequelize";
export default class CategoryService extends Base {
  async tree(query) {
    const attributes = ['id', 'parent_id', 'name'];
    const { id, is_top_level } = query || {};
    const where = {
      status: true,
    }
    if (id) {
      Object.assign(where, { id });
    }
    if (is_top_level) {
      Object.assign(where, { parent_id: null });
    }
    const rows = await category.findAll({
      where,
      attributes,
      raw: true,
    });
    return this.utils.installTree(rows, { key_fid: "parent_id" });
  }
  all(params) {
    const { name, status } = params;
    const where = {};
    if (status !== undefined) where.status = status;

    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return category.findAndCountAll({
      where,
    })
  }
  list(params) {
    const { name, status = 1, page = 1, pageSize = 20 } = params;
    const where = {
      status
    };
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `LIKE '%${name}%'` } });
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    // 原始查询，效率更高
    return category.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true
    }
    ).then(async (res) => this.composePaginationData(res, page, pageSize))
  }
  async findOne(id) {
    return category.findByPk(id);
  }

  async create(data) {
    const { name, code, status, remark, sort_order } = data;
    const existing = await category.findOne({
      where: { name, }
    });
    if (existing) {
      throw new Error(`角色${name}已存在`);
    }
    return category.create({
      name,
      code,
      status, sort_order, remark
    });
  }

  async update(data) {
    const { id, ...reset } = data;
    const res = await category.findByPk(id);
    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
    }
    return res.update(reset);
  }
  async delete(id) {
    const res = await category.findByPk(id);
    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
