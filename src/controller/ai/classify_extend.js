/**
 * @Author: colpu
 * @Date: 2026-04-30 13:08:06
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 20:17:58
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

const exampleItemSchema = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().optional(),
    src: Joi.string().allow("").optional(),
    title: Joi.string().allow("").optional(),
    desc: Joi.string().allow("").optional(),
    size: Joi.object({
      width: Joi.number().optional(),
      height: Joi.number().optional(),
    }).optional(),
  }),
);

const extendBodySchema = {
  classify_id: Joi.number().integer().optional(),
  feature: Joi.string().max(500).allow("", null),
  icon: Joi.string().max(100).allow("", null),
  src: Joi.string().max(255).allow("", null),
  original_src: Joi.string().max(255).allow("", null),
  slider_percent: Joi.number().min(0).max(1).optional(),
  is_scale: Joi.boolean().optional(),
  example_right: Joi.alternatives()
    .try(exampleItemSchema, Joi.string())
    .optional(),
  example_error: Joi.alternatives()
    .try(exampleItemSchema, Joi.string())
    .optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
};

export default class ClassifyExtendController extends Controller {
  // 前端接口
  async all(ctx) {
    const res = await this.service.ai.classifyExtend.all();
    // 兼容第一个版本的接口
    if (ctx.path === "/api/ai/skill") {
      res.forEach(item => {
        item.okExample = item.example_right;
        item.faildExample = item.example_error;
        item.isscale = item.is_scale;
        item.desc = item.feature;
        item.action = item.model;
        delete item.example_right;
        delete item.example_error;
        delete item.is_scale;
        delete item.feature;
        delete item.model;
      });
    }
    ctx.respond(res);
  }

  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        classify_id: Joi.number().integer().optional(),
        status: Joi.number().integer().valid(0, 1).optional(),
        feature: Joi.string().optional(),
      }),
    );
    const data = await this.service.ai.classifyExtend.list(query);
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.classifyExtend.findOne(id);
    ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.validate({
      body: {
        classify_id: Joi.number().integer().required(),
        src: Joi.string().max(255).required(),
        original_src: Joi.string().max(255).required(),
        ...extendBodySchema,
      },
    });
    const data = await this.service.ai.classifyExtend.create(body);
    ctx.respond(data, null, "创建成功");
  }

  async update(ctx) {
    const body = ctx.validate({
      body: {
        id: Joi.number().integer().required(),
        ...extendBodySchema,
      },
    });
    const data = await this.service.ai.classifyExtend.update(body);
    ctx.respond(data, null, "更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.classifyExtend.delete(id);
    ctx.respond(data, data ? 0 : 1, data ? "已下架" : "操作失败");
  }
}
