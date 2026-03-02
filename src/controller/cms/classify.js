/**
 * @Author: colpu
 * @Date: 2025-11-22 19:54:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-11 21:49:58
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 分类管理控制器（CMS）
 */
export default class ClassifyController extends Controller {
  /**
   * @api {get} /classify/all
   * @apiName classifyAll
   * @apiDescription 获取所有分类
   * @apiGroup CMS-Classify
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Object} query 查询参数
   * @apiSuccess {Array} data 分类列表
   */
  async all(ctx) {
    const data = await this.service.cms.classify.all(ctx.query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /classify/tree
   * @apiName classifyTree
   * @apiDescription 获取分类树形结构
   * @apiGroup CMS-Classify
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Boolean} [exclude] 是否排除某些项
   * @apiSuccess {Array} data 分类树
   */
  async tree(ctx) {
    const { exclude } = ctx.validateAsync({
      query: {
        exclude: Joi.boolean(),
      },
    });
    const data = await this.service.cms.classify.tree(exclude);
    return ctx.respond(data);
  }
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.classify.all(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /classify
   * @apiName classifyFindOne
   * @apiDescription 根据ID获取分类详情
   * @apiGroup CMS-Classify
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 分类ID (必需)
   * @apiSuccess {Object} data 分类详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.classify.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /classify
   * @apiName classifyCreate
   * @apiDescription 创建分类
   * @apiGroup CMS-Classify
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 分类名称 (必需)
   * @apiBody {Number} [parent_id] 父分类ID
   * @apiSuccess {Object} data 创建的分类信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.cms.classify.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /classify
   * @apiName classifyUpdate
   * @apiDescription 更新分类
   * @apiGroup CMS-Classify
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 分类ID (必需)
   * @apiBody {Number} [parent_id] 父分类ID
   * @apiSuccess {Object} data 更新后的分类信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    if (!body.parent_id) {
      body.parent_id = null;
    }
    const data = await this.service.cms.classify.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /classify
   * @apiName classifyDelete
   * @apiDescription 删除分类
   * @apiGroup CMS-Classify
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 分类ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.classify.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };
}
