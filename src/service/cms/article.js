/**
 * @Author: colpu
 * @Date: 2025-12-15 21:14:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-13 00:41:07
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { articles, articleTags } from "../../models/cms/index.js";
import { Op } from "sequelize";
export default class ArticleService extends Base {
  async findTags(article_id) {
    const where = {
      article_id
    }
    const res = await articleTags.findAll({
      where,
      attributes: ['tag_id'],
      raw: true
    });
    return res.map(item => item.tag_id);
  }
  list(params) {
    const { status, page = 1, pageSize = 20, name, type } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    if (type !== undefined) where.type = type;
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return articles.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'title', 'subtitle', 'author', 'status', 'sort_order', 'created_at'],
      raw: true
    })
      // 列表没有必要查询标签，可以在查询详情时查询标签
      // .then(async (res) => {
      //   const { rows = [] } = res || {};
      //   for (const item of rows) {
      //     item.tag_ids = await this.findTags(item.id);
      //   }
      //   return res;
      // })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
  async findOne(id) {
    const res = await articles.findByPk(id, {
      raw: true
    }).then(async (res) => {
      if (res) {
        res.tag_ids = await this.findTags(res.id);
      }
      return res;
    })
    if (!res) {
      throw new Error(`文章ID：${id}不存在`);
    }
    return res;
  }
  async bulkCreate(dataArray) {
    return articles.bulkCreate(dataArray);
  }
  async create(data) {
    const { title, tag_ids } = data;
    const existing = await articles.findOne({
      where: {
        title
      }
    });
    if (existing) {
      throw new Error(`文章${title}已存在`);
    }
    if (tag_ids && Array.isArray(tag_ids)) {
      articles.setTags(tag_ids);
    }
    return articles.create(data);
  }
  async update(data) {
    const { id, tag_ids, ...rest } = data;
    const res = await articles.findByPk(id);
    if (!res) {
      throw new Error(`文章ID：${id}不存在`);
    }

    if (tag_ids && Array.isArray(tag_ids)) {
      res.setTags(tag_ids);
    }
    return res.update(rest);
  }
  async delete(id) {
    const res = await articles.findByPk(id);
    if (!res) {
      throw new Error(`文章ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
