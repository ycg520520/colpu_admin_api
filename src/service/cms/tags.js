/**
 * @Author: colpu
 * @Date: 2025-12-18 21:53:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 16:13:01
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { tags } from "../../models/cms/index.js";
import { Op } from "sequelize";
export default class TagsService extends Base {
  all() {
    return tags.findAll({
      attributes: ['id', 'name', 'code']
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
    return tags.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  async findOne(id) {
    const res = await tags.findByPk(id);
    if (!res) {
      throw new Error(`标签ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { name } = data;
    const existing = await tags.findOne({
      where: {
        name
      }
    });
    if (existing) {
      throw new Error(`标签${name}已存在`);
    }
    return tags.create(data);
  }
  async update(data) {
    const {id, ...rest} = data;
    const res = await tags.findByPk(id);
    if (!res) {
      throw new Error(`标签ID：${id}不存在`);
    }
    return res.update(rest);
  }
  async delete(id) {
    const res = await tags.findByPk(id);
    if (!res) {
      throw new Error(`标签ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
