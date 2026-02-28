/**
 * @Author: colpu
 * @Date: 2026-01-14 09:14:00
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 17:21:52
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { friendLink } from "../../models/cms/index.js";
import { Op } from "sequelize";
export default class FriendService extends Base {
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
    return friendLink.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  async findOne(id) {
    const res = await friendLink.findByPk(id, {
      raw: true
    })
    if (!res) {
      throw new Error(`友链ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { name } = data;
    const existing = await friendLink.findOne({
      where: {
        name
      }
    });
    if (existing) {
      throw new Error(`友链${name}已存在`);
    }
    return friendLink.create(data);
  }
  async update(data) {
    const { id, ...rest } = data;
    const res = await friendLink.findByPk(id);
    if (!res) {
      throw new Error(`友链ID：${id}不存在`);
    }
    return res.update(rest);
  }
  async delete(id) {
    const res = await friendLink.findByPk(id);
    if (!res) {
      throw new Error(`友链ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
