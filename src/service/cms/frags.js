/**
 * @Author: colpu
 * @Date: 2026-01-16 15:30:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-27 17:13:41
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { frags } from "../../models/cms/index.js";
import { Op } from "sequelize";
export default class FragsService extends Base {
  list(params) {
    const { status, page = 1, pageSize = 20, title } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (title) {
      orArr.push({ title: { [Op.like]: `%${title}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return frags.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  async findOne(id) {
    const res = await frags.findByPk(id);
    if (!res) {
      throw new Error(`碎片ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { title } = data;
    const existing = await frags.findOne({
      where: {
        title
      }
    });
    if (existing) {
      throw new Error(`碎片《${title}》已存在`);
    }
    return frags.create(data);
  }
  async update(data) {
    const {id, ...rest} = data;
    const res = await frags.findByPk(id);
    if (!res) {
      throw new Error(`碎片ID：${id}不存在`);
    }
    return res.update(rest);
  }
  async delete(id) {
    const res = await frags.findByPk(id);
    if (!res) {
      throw new Error(`碎片ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
