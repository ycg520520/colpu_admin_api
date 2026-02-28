/**
 * @Author: colpu
 * @Date: 2025-11-22 20:33:37
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-30 18:01:54
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { post } from "../models/sys/index.js";
import { Op } from "sequelize";
export default class PostService extends Base {
  getPostList(params) {
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
    return post.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  getPostAll() {
    return post.findAll({
      where: {
        status: 1
      },
      attributes: ['id', 'name', 'code']
    })
  }
  async getPost(id) {
    const res = await post.findByPk(id);
    if (!res) {
      throw new Error(`岗位ID：${id}不存在`);
    }
    return res;
  }
  async createPost(data) {
    const { name } = data;
    const existing = await post.findOne({
      where: {
        name
      }
    });
    if (existing) {
      throw new Error(`岗位${name}已存在`);
    }
    return post.create(data);
  }
  async updatePost(data) {
    const id = data.id;
    delete data.id;
    const res = await post.findByPk(id);

    if (!res) {
      throw new Error(`部门ID：${id}不存在`);
    }
    return res.update(data);
  }
  async deletePost(id) {
    const res = await post.findByPk(id);
    if (!res) {
      throw new Error(`岗位ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
