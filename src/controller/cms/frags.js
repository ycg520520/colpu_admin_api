/**
 * @Author: colpu
 * @Date: 2026-01-16 15:28:04
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-27 17:14:07
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 碎片管理控制器（CMS），用于管理页面片段内容
 */
export default class FragsController extends Controller {

  /**
   * @api {get} /frags/list
   * @apiName fragsList
   * @apiDescription 分页获取碎片列表
   * @apiGroup CMS-Frags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页碎片列表
   */
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.frags.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /frags
   * @apiName fragsFindOne
   * @apiDescription 根据ID获取碎片详情
   * @apiGroup CMS-Frags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 碎片ID (必需)
   * @apiSuccess {Object} data 碎片详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.frags.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /frags
   * @apiName fragsCreate
   * @apiDescription 创建碎片
   * @apiGroup CMS-Frags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} title 标题 (必需)
   * @apiBody {Number} type 类型 (必需)
   * @apiBody {String} content 内容 (必需)
   * @apiSuccess {Object} data 创建的碎片信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        title: Joi.string().required(),
        type: Joi.number().required(),
        content: Joi.string().required(),
      },
    });

    const data = await this.service.cms.frags.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /frags
   * @apiName fragsUpdate
   * @apiDescription 更新碎片
   * @apiGroup CMS-Frags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 碎片ID (必需)
   * @apiSuccess {Object} data 更新后的碎片信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.frags.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /frags
   * @apiName fragsDelete
   * @apiDescription 删除碎片
   * @apiGroup CMS-Frags
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 碎片ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.frags.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
