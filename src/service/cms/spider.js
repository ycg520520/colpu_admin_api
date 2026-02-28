/**
 * @Author: colpu
 * @Date: 2026-01-14 22:19:02
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-09 17:20:22
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { spider } from "../../models/cms/index.js";
import { Op } from "sequelize";
export default class SpiderService extends Base {
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
    return spider.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  findAll() {
    return spider.findAll({
      where: {
        stauts: 1
      },
      raw: true
    });
  }
  async findOne(id) {
    const res = await spider.findByPk(id, {
      raw: true
    })
    if (!res) {
      throw new Error(`爬虫ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { title } = data;
    const existing = await spider.findOne({
      where: {
        title
      }
    });
    if (existing) {
      throw new Error(`爬虫标题:《${title}》已存在`);
    }
    return spider.create(data);
  }
  async update(data) {
    const { id, ...rest } = data;
    const res = await spider.findByPk(id);
    if (!res) {
      throw new Error(`爬虫ID：${id}不存在`);
    }
    return res.update(rest);
  }
  async delete(id) {
    const res = await spider.findByPk(id);
    if (!res) {
      throw new Error(`爬虫ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
