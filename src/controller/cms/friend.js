/**
 * @Author: colpu
 * @Date: 2026-01-14 08:48:00
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 16:47:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 友链管理控制器（CMS）
 */
export default class FriendController extends Controller {
  /**
   * @api {get} /friend/list
   * @apiName friendList
   * @apiDescription 分页获取友链列表
   * @apiGroup CMS-Friend
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页友链列表
   */
  async list(ctx) {
    const query = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.cms.friend.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /friend
   * @apiName friendFindOne
   * @apiDescription 根据ID获取友链详情
   * @apiGroup CMS-Friend
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 友链ID (必需)
   * @apiSuccess {Object} data 友链详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.friend.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /friend
   * @apiName friendCreate
   * @apiDescription 创建友链
   * @apiGroup CMS-Friend
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 友链名称 (必需)
   * @apiBody {String} [url] 链接地址
   * @apiSuccess {Object} data 创建的友链信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.cms.friend.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /friend
   * @apiName friendUpdate
   * @apiDescription 更新友链
   * @apiGroup CMS-Friend
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 友链ID (必需)
   * @apiSuccess {Object} data 更新后的友链信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });

    const data = await this.service.cms.friend.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /friend
   * @apiName friendDelete
   * @apiDescription 删除友链
   * @apiGroup CMS-Friend
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 友链ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.friend.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
