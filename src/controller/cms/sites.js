/**
 * @Author: colpu
 * @Date: 2026-01-07 16:10:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 17:14:47
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
export default class SitesController extends Controller {
  async find(ctx) {
    const data = await this.service.cms.sites.find();
    return ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.request.body;
    const data = await this.service.cms.sites.create(body);
    ctx.respond(data, null, '添加成功');
  };

  async update(ctx) {
    const body = ctx.request.body;
    const data = await this.service.cms.sites.update(body);
    ctx.respond(data, null, '更新成功');

  };
}
