/**
 * @Author: colpu
 * @Date: 2026-03-29 15:50:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-13 21:25:16
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

import { Controller } from "@colpu/core";
import Joi from "joi";

const classifyBodySchema = {
  name: Joi.string().max(100),
  description: Joi.string().max(500).allow("", null),
  icon: Joi.string().max(100).allow("", null),
  banner: Joi.string().max(255).allow("", null),
  path: Joi.string().max(255).allow("", null),
  model: Joi.string().max(100).allow("", null),
  upload_opt: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
  prompt: Joi.string().allow("", null),
  prompt_variables: Joi.alternatives().try(Joi.array(), Joi.object(), Joi.string()).optional(),
  aspect_ratio: Joi.string().max(20).allow("", null),
  enable_crop: Joi.number().integer().valid(0, 1).optional(),
  enable_face_detect: Joi.number().integer().valid(0, 1).optional(),
  enable_grid_split: Joi.number().integer().valid(0, 1).optional(),
  enable_enhance: Joi.number().integer().valid(0, 1).optional(),
  enable_size: Joi.number().integer().valid(0, 1).optional(),
  cost_point: Joi.number().integer().min(0).optional(),
  cost_point_hd: Joi.number().integer().min(0).optional(),
  size: Joi.string().max(20).optional(),
  size_hd: Joi.string().max(20).optional(),
  output_width: Joi.number().integer().allow(null).optional(),
  output_height: Joi.number().integer().allow(null).optional(),
  output_dpi: Joi.number().integer().allow(null).optional(),
  is_hot: Joi.number().integer().valid(0, 1).optional(),
  is_tip: Joi.number().integer().valid(0, 1).optional(),
  sort_order: Joi.number().integer().optional(),
  remark: Joi.string().max(500).allow("", null),
  disabled: Joi.number().integer().valid(0, 1).optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
  template_ids: Joi.array().items(Joi.number().integer()).optional(),
};

export default class ClassifyController extends Controller {
  async tree(ctx) {
    const res = await this.service.ai.classify.tree();
    ctx.respond(res);
  }
  async all(ctx) {
    const query = ctx.validate({
      query: {
        name: Joi.string().optional(),
      }
    })
    const res = await this.service.ai.classify.all(query);
    ctx.respond(res);
  }

  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        name: Joi.string().optional(),
        status: Joi.number().integer().valid(0, 1).optional(),
        disabled: Joi.number().integer().valid(0, 1).optional(),
      }),
    );
    const data = await this.service.ai.classify.list(query);
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.classify.findOne(id);
    ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.validate({
      body: {
        name: Joi.string().required(),
        ...classifyBodySchema,
      },
    });
    const data = await this.service.ai.classify.create(body);
    ctx.respond(data, null, "创建成功");
  }

  async update(ctx) {
    const body = ctx.validate({
      body: {
        id: Joi.number().integer().required(),
        ...classifyBodySchema,
      },
    });
    const data = await this.service.ai.classify.update(body);
    ctx.respond(data, null, "更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.classify.delete(id);
    ctx.respond(data, data ? 0 : 1, data ? "已下架" : "操作失败");
  }
}
