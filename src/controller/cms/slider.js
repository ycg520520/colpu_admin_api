/**
 * @Author: colpu
 * @Date: 2026-01-14 16:48:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 22:15:39
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class SliderController extends Controller {
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.slider.list(query);
    return ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.slider.findOne(id);
    ctx.respond(data);
  };

  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        title: Joi.string().required(),
        src: Joi.string().required(),
      },
    });

    const data = await this.service.cms.slider.create(body);
    ctx.respond(data, null, '创建成功');
  };

  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });

    const data = await this.service.cms.slider.update(body);
    ctx.respond(data, null, '更新成功');

  };

  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.slider.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
