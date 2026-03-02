/**
 * @Author: colpu
 * @Date: 2025-11-22 19:54:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:16:23
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 岗位管理控制器
 */
export default class PostController extends Controller {
  /**
   * @api {get} /post/list
   * @apiName postList
   * @apiDescription 分页获取岗位列表
   * @apiGroup Post
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页岗位列表
   */
  async list(ctx) {
    const params = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.post.getPostList(params);
    return ctx.respond(data);
  }

  /**
   * @api {get} /post
   * @apiName postFindOne
   * @apiDescription 根据ID获取岗位详情
   * @apiGroup Post
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 岗位ID (必需)
   * @apiSuccess {Object} data 岗位详情
   */
  async findOne(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.post.getPost(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /post
   * @apiName postCreate
   * @apiDescription 创建岗位
   * @apiGroup Post
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 岗位名称 (必需)
   * @apiSuccess {Object} data 创建的岗位信息
   */
  async create(ctx) {
    const body = ctx.request.body;
    ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.post.createPost(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /post
   * @apiName postUpdate
   * @apiDescription 更新岗位
   * @apiGroup Post
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 岗位ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的岗位信息
   */
  async update(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.post.updatePost(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /post
   * @apiName postDelete
   * @apiDescription 删除岗位
   * @apiGroup Post
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 岗位ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.post.deletePost(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
