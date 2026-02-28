/**
 * @Author: colpu
 * @Date: 2025-11-20 08:57:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:27:00
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { departments } from "../models/sys/index.js";
import { Op } from "sequelize";
export default class DepartmentsService extends Base {
  tree() {
    const attributes = ['id', 'parent_id', 'name'];
    return departments.findAll({
      where: {
        status: true,
      },
      attributes
    })
  }
  list(params) {
    const { status, page = 1, pageSize = 99999, name } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return departments.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  async findOne(id) {
    const res = await departments.findByPk(id);
    if (!res) {
      throw new Error(`部门ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { leader_id, ...createData } = data;
    const name = createData.name;
    const existing = await departments.findOne({
      where: {
        name
      }
    });
    if (existing) {
      throw new Error(`部门${name}已存在`);
    }
    return departments.create(createData);
  }
  async update(data) {
    const { id, ...updateData } = data;
    const res = await departments.findByPk(id);
    if (!res) {
      throw new Error(`部门ID：${id}不存在`);
    }
    return res.update(updateData);
  }
  async delete(id) {
    const res = await departments.findByPk(id);
    if (!res) {
      throw new Error(`部门ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
