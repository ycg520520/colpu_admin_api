/**
 * @Author: colpu
 * @Date: 2025-11-14 12:09:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:32:09
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class MenusController extends Controller {
  async tree(ctx) {
    const data = await this.service.menus.tree();
    return ctx.respond(data);
  }
  async all(ctx) {
    const data = await this.service.menus.all(ctx.query);
    return ctx.respond(data);
  }
  async routes(ctx) {
    const { id } = ctx.state.user
    const data = await this.service.menus.routes(id);
    return ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.menus.findOne(id);
    ctx.respond(data);
  };

  async create(ctx) {
    const body = ctx.request.body;
    const validate = {
      menu_type: Joi.number().required(),
      title: Joi.string().required(),
    }
    if ([0, 1].includes(body.menu_type)) {
      Object.assign(validate, {
        name: Joi.string().required(),
      })
    }
    ctx.validateAsync({
      body: validate,
    });

    const data = await this.service.menus.create(body);
    ctx.respond(data, null, '创建成功');
  };

  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.menus.update(body);
    ctx.respond(data, null, '更新成功');

  };

  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.menus.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
