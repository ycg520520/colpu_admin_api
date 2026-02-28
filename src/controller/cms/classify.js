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
export default class ClassifyController extends Controller {
  async all(ctx) {
    const data = await this.service.cms.classify.all(ctx.query);
    return ctx.respond(data);
  }
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

  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.classify.findOne(id);
    ctx.respond(data);
  };

  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.cms.classify.create(body);
    ctx.respond(data, null, '创建成功');
  };

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
