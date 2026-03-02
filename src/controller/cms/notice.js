/**
 * @Author: colpu
 * @Date: 2026-01-07 16:10:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-16 15:28:04
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 公告管理控制器（CMS）
 */
export default class NoticeController extends Controller {

  /**
   * @api {get} /notice/list
   * @apiName noticeList
   * @apiDescription 分页获取公告列表
   * @apiGroup CMS-Notice
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页公告列表
   */
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.notice.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /notice
   * @apiName noticeFindOne
   * @apiDescription 根据ID获取公告详情
   * @apiGroup CMS-Notice
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 公告ID (必需)
   * @apiSuccess {Object} data 公告详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.notice.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /notice
   * @apiName noticeCreate
   * @apiDescription 创建公告
   * @apiGroup CMS-Notice
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} title 公告标题 (必需)
   * @apiBody {Number} type 类型 (必需)
   * @apiBody {String} content 内容 (必需)
   * @apiSuccess {Object} data 创建的公告信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        title: Joi.string().required(),
        type: Joi.number().required(),
        content: Joi.string().required(),
      },
    });

    const data = await this.service.cms.notice.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /notice
   * @apiName noticeUpdate
   * @apiDescription 更新公告
   * @apiGroup CMS-Notice
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 公告ID (必需)
   * @apiSuccess {Object} data 更新后的公告信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.notice.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /notice
   * @apiName noticeDelete
   * @apiDescription 删除公告
   * @apiGroup CMS-Notice
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 公告ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.notice.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
