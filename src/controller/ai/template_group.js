/**
 * @Author: colpu
 * @Date: 2026-06-09 15:43:33
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 17:39:36
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved. 
 */
/**
 * 运营后台：AI 模版
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

const templateBodySchema = {
  category_id: Joi.number().integer().required(),
  name: Joi.string().max(100).allow("", null),
  img_src: Joi.string().max(255).allow("", null),
  img_width: Joi.number().integer().allow(null).optional(),
  img_height: Joi.number().integer().allow(null).optional(),
  line_art_src: Joi.string().max(255).allow("", null),
  prompt: Joi.string().allow("", null),
  prompt_variables: Joi.alternatives()
    .try(Joi.array(), Joi.object(), Joi.string())
    .optional(),
  sort_order: Joi.number().integer().optional(),
  remark: Joi.string().max(500).allow("", null),
  status: Joi.number().integer().valid(0, 1).optional(),
  classify_ids: Joi.array().items(Joi.number().integer()).optional(),
};

export default class TemplateGroupController extends Controller {
  async all(ctx) {
    const data = await this.service.ai.templateGroup.all();
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.templateGroup.findOne(id);
    ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.validate({
      body: templateBodySchema,
    });
    const data = await this.service.ai.templateGroup.create(body);
    ctx.respond(data, null, "创建成功");
  }

  async update(ctx) {
    const body = ctx.validate({
      body: {
        id: Joi.number().integer().required(),
        ...templateBodySchema,
        category_id: Joi.number().integer().optional(),
      },
    });
    const data = await this.service.ai.templateGroup.update(body);
    ctx.respond(data, null, "更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.templateGroup.delete(id);
    ctx.respond(data, data ? 0 : 1, data ? "已下架" : "操作失败");
  }

  async categories(ctx) {
    const data = await this.service.ai.templateGroup.categoryTree();
    ctx.respond(data);
  }
}
