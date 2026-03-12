/**
 * @Author: colpu
 * @Date: 2025-12-15 21:15:03
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-11 16:35:51
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 文章管理控制器（CMS）
 */
export default class ArticleController extends Controller {
  /**
   * @api {get} /article/list
   * @apiName articleList
   * @apiDescription 分页获取文章列表
   * @apiGroup CMS-Article
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页文章列表
   */
  async list(ctx) {
    const query = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.cms.article.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /article
   * @apiName articleFindOne
   * @apiDescription 根据ID获取文章详情
   * @apiGroup CMS-Article
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 文章ID (必需)
   * @apiSuccess {Object} data 文章详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.article.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /article
   * @apiName articleCreate
   * @apiDescription 创建文章
   * @apiGroup CMS-Article
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 文章标题 (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 创建的文章信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.cms.article.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /article
   * @apiName articleUpdate
   * @apiDescription 更新文章
   * @apiGroup CMS-Article
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 文章ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的文章信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });

    const data = await this.service.cms.article.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /article
   * @apiName articleDelete
   * @apiDescription 删除文章
   * @apiGroup CMS-Article
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 文章ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.article.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
