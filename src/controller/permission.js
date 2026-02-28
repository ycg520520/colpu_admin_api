/**
 * @Author: colpu
 * @Date: 2025-11-30 18:02:30
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:36:43
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class PermissionController extends Controller {
  async list(ctx) {
    const params = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.permission.list(params);
    return ctx.respond(data);
  }

  async findOne(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.permission.findOne(id);
    ctx.respond(data);
  };
  async tree(ctx) {
    const data = await this.service.permission.tree();
    ctx.respond(data);
  };

  async give(ctx) {
    const body = ctx.validateAsync({
      body: {
        role_id: Joi.number().required(),
        perm_ids: Joi.array().items(Joi.number()).required()
      },
    });
    const data = await this.service.permission.give(body);
    ctx.respond(data);
  };

  async create(ctx) {
    const body = ctx.request.body;
    ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.permission.create(body);
    ctx.respond(data, null, '创建成功');
  };

  async update(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.permission.update(body);
    ctx.respond(data, null, '更新成功');

  };

  async delete(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.permission.delete(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

  async permUsers(ctx) {
    const { perm_id } = ctx.validateAsync({
      query: {
        perm_id: Joi.number().required(),
      },
    });
    const data = await this.service.permission.permUsers(perm_id);
    ctx.respond(data);
  }
}
