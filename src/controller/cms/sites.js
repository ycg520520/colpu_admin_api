/**
 * @Author: colpu
 * @Date: 2026-01-07 16:10:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 17:14:47
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";

/**
 * 站点配置控制器（CMS）
 */
export default class SitesController extends Controller {
  /**
   * @api {get} /site
   * @apiName siteFind
   * @apiDescription 获取站点配置
   * @apiGroup CMS-Site
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Object} data 站点配置
   */
  async find(ctx) {
    const data = await this.service.cms.sites.find();
    return ctx.respond(data);
  }

  /**
   * @api {post} /site
   * @apiName siteCreate
   * @apiDescription 创建/添加站点配置
   * @apiGroup CMS-Site
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Object} body 站点配置字段
   * @apiSuccess {Object} data 创建的站点配置
   */
  async create(ctx) {
    const body = ctx.request.body;
    const data = await this.service.cms.sites.create(body);
    ctx.respond(data, null, '添加成功');
  };

  /**
   * @api {put} /site
   * @apiName siteUpdate
   * @apiDescription 更新站点配置
   * @apiGroup CMS-Site
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Object} body 站点配置字段
   * @apiSuccess {Object} data 更新后的站点配置
   */
  async update(ctx) {
    const body = ctx.request.body;
    const data = await this.service.cms.sites.update(body);
    ctx.respond(data, null, '更新成功');

  };
}
