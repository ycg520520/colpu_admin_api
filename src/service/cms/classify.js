/**
 * @Author: colpu
 * @Date: 2025-11-22 20:33:37
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-10 15:55:05
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { classify } from "../../models/cms/index.js";
import { Op } from "sequelize";
export default class ClassifyService extends Base {
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
    return classify.findAndCountAll({
      where,
      raw: true
    })
  }
  tree(excludeHome = true, attributes = ['id', 'parent_id', 'name', 'type', 'code', 'path']) {
    const where = {
      status: true,
    }
    if (excludeHome) {
      where.code = { [Op.ne]: 'home' }
    }
    return classify.findAll({
      where,
      attributes,
      raw: true
    })
  }
  list(params) {
    const { status, page = 1, pageSize = 20, name } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return classify.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  async findOne(id) {
    const res = await classify.findByPk(id, { raw: true });
    if (!res) {
      throw new Error(`分类ID：${id}不存在`);
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
}
