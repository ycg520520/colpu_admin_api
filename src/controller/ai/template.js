/**
 * @Author: colpu
 * @Date: 2026-05-22 12:09:06
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 17:39:43
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

export default class TemplateController extends Controller {
  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        name: Joi.string().optional(),
        status: Joi.number().integer().valid(0, 1).optional(),
        category_id: Joi.number().integer().optional(),
        classify_id: Joi.number().integer().optional(),
      }),
    );
    const data = await this.service.ai.template.list(query);
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.template.findOne(id);
    ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.validate({
      body: templateBodySchema,
    });
    const data = await this.service.ai.template.create(body);
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
    const data = await this.service.ai.template.update(body);
    ctx.respond(data, null, "更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.template.delete(id);
    ctx.respond(data, data ? 0 : 1, data ? "已下架" : "操作失败");
  }

  async categories(ctx) {
    const data = await this.service.ai.template.categoryTree();
    ctx.respond(data);
  }
}
