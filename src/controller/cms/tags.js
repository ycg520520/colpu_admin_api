/**
 * @Author: colpu
 * @Date: 2025-12-18 21:52:52
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-07 16:09:58
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 标签管理控制器（CMS）
 */
export default class TagsController extends Controller {
  /**
   * @api {get} /tags/all
   * @apiName tagsAll
   * @apiDescription 获取所有标签
   * @apiGroup CMS-Tags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 标签列表
   */
  async all(ctx) {
    const data = await this.service.cms.tags.all();
    return ctx.respond(data);
  }

  /**
   * @api {get} /tags/list
   * @apiName tagsList
   * @apiDescription 分页获取标签列表
   * @apiGroup CMS-Tags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页标签列表
   */
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.tags.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /tags
   * @apiName tagsFindOne
   * @apiDescription 根据ID获取标签详情
   * @apiGroup CMS-Tags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 标签ID (必需)
   * @apiSuccess {Object} data 标签详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.tags.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /tags
   * @apiName tagsCreate
   * @apiDescription 创建标签
   * @apiGroup CMS-Tags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 标签名称 (必需)
   * @apiSuccess {Object} data 创建的标签信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.cms.tags.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /tags
   * @apiName tagsUpdate
   * @apiDescription 更新标签
   * @apiGroup CMS-Tags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 标签ID (必需)
   * @apiSuccess {Object} data 更新后的标签信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.tags.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /tags
   * @apiName tagsDelete
   * @apiDescription 删除标签
   * @apiGroup CMS-Tags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 标签ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.tags.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
