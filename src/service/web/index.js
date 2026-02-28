/**
 * @Author: colpu
 * @Date: 2026-02-10 16:17:00
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-27 16:15:35
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { frags, sites, articles, cmsdb, articleTags, tags, classify } from "../../models/cms/index.js";
import { Op, QueryTypes } from "sequelize";
export default class FragsService extends Base {
  feature(type) {
    const where = {};
    if (type) {
      where.type = type;
    }
    return frags.findAll({
      where,
      attributes: ["id", "title", "content", "type"],
    })
  }
  site() {
    return sites.findAll().then(res => res[0])
  }
  async articleList(params) {
    const { page = 1, pageSize = 20, category } = params;
    const query = `
      WITH RECURSIVE classify_tree AS (
        -- 初始查询：获取根节点
        SELECT id, name, parent_id, path
        FROM classify
        WHERE code=:category
        UNION ALL
        -- 递归查询：获取子节点
        SELECT c.id, c.name, c.parent_id, c.path
        FROM classify c
        INNER JOIN classify_tree AS ct ON c.parent_id = ct.id
      )
      -- SELECT id FROM classify_tree WHERE code!=:category ORDER BY id; # 过滤当前分类
      SELECT id, path, name FROM classify_tree; # 包括当前分类
    `;
    const [results] = await cmsdb.query(query, {
      replacements: { category },
      type: QueryTypes.SELECT,
      raw: true,
    });
    const list = Array.isArray(results) ? results : Object.values(results);
    if (list.length === 0) {
      throw new Error(`不存在的分类：${category}不存在`);
    }

    const classifyIds = list.map(item => {
      return item.id;
    });

    const classifyMap = {};
    list.forEach(item => {
      classifyMap[item.id] = item;
    });

    const where = {
      status: 1,
      // 控制发布时间小于当前时间或者发布时间为空的文章都可以展示
      [Op.or]: [
        {
          published_at: {
            [Op.lt]: new Date()  // 发布时间小于当前时间
          }
        },
        {
          published_at: {
            [Op.is]: null  // 发布时间为空
          }
        }
      ]
    };
    if (classifyIds.length) {
      where.classify_id = { [Op.in]: classifyIds };
    }
    return articles.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'title', 'thumb', 'summary', 'author', 'created_at', 'pv', 'classify_id'],
      raw: true
    })
      .then((res) => {
        res.rows.forEach(item => {
          item.classify = classifyMap[item.classify_id] || {};
        });
        return this.composePaginationData(res, page, pageSize);
      });
  }

  // 递归查询分类及其所有父级
  async getCategoryWithParents(id) {
    const query = `
    WITH RECURSIVE classify_tree AS (
      -- 初始查询：获取当前分类
      SELECT id, name, parent_id, path, 1 AS depth
      FROM classify
      WHERE id=:id
      UNION ALL
      -- 递归查询：获取父级
      SELECT c.id, c.name, c.parent_id, c.path, ct.depth + 1
      FROM classify c
      INNER JOIN classify_tree ct ON c.id = ct.parent_id
    )
    SELECT name, path FROM classify_tree ORDER BY depth DESC;
  `;
    const results = await cmsdb.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    return results;
  }

  async articleDetail(id) {
    const res = await articles.findByPk(id).then(async (res) => {
      // 增加浏览量
      if (res) {
        res.increment('pv');
      }
      const data = res.get({ plain: true });

      // 通过分类ID查询分类及其所有父级，构建面包屑导航
      if (data.classify_id) {
        data.crumbs = await this.getCategoryWithParents(data.classify_id);
        data.crumbs.unshift({ name: '首页', path: '/' });
        data.crumbs.push({ name: data.title });
      }
      // 查询标签ID列表
      const tags = await articleTags.findAll({
        where: {
          article_id: data.id
        },
        attributes: ['tag_id'],
        raw: true
      });
      data.tags = tags
      return data;
    })
    if (!res) {
      throw new Error(`文章ID：${id}不存在`);
    }
    return res;
  }

  async articleListByType(params) {
    const { type, size = 5 } = params;
    return articles.findAll({
      where: { type },
      limit: size,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'thumb', 'summary', 'author', 'created_at'],
      raw: true
    });
  }

  async articleTags(params) {
    const { size = 20 } = params;
    return tags.findAll({
      limit: size,
      order: [['count', 'DESC']],
      attributes: ['id', 'name', 'code'],
      raw: true
    });
  }

  async tagArticleList(params) {
    const { page = 1, pageSize = 20, id } = params;
    const where = {
      status: 1,
      // 控制发布时间小于当前时间或者发布时间为空的文章都可以展示
      [Op.or]: [
        {
          published_at: {
            [Op.lt]: new Date()  // 发布时间小于当前时间
          }
        },
        {
          published_at: {
            [Op.is]: null  // 发布时间为空
          }
        }
      ]
    };
    const classifyMap = {};
    const classifyList = await classify.findAll({
      where: { status: 1 },
      attributes: ['id', 'path', 'name'],
      raw: true
    });
    classifyList.forEach(item => {
      classifyMap[item.id] = item;
    });
    const tag = await tags.findOne({
      where: { id },
      attributes: ['id', 'name'],
      raw: true
    });
    if (!tag) {
      throw new Error(`标签ID：${id}不存在`);
    }
    const articleIds = await articleTags.findAll({
      where: { tag_id: id },
      attributes: ['article_id'],
      raw: true
    });
    if (articleIds.length) {
      where.id = { [Op.in]: articleIds.map(item => item.article_id) };
    } else {
      where.id = { [Op.is]: null };
    }
    return articles.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'title', 'thumb', 'summary', 'author', 'created_at', 'pv', 'classify_id'],
      raw: true
    })
      .then((res) => {
        res.tag = tag; // 添加标签信息
        res.rows.forEach(item => {
          item.classify = classifyMap[item.classify_id] || {};
        });
        return this.composePaginationData(res, page, pageSize);
      });
  }
}
