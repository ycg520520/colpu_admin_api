/**
 * @Author: colpu
 * @Date: 2026-05-22 09:44:21
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 15:25:54
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

const slotBody = {
  slot_type: Joi.string().valid("splash", "banner", "custom", "list").optional(),
  sort_order: Joi.number().integer().optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
  enabled: Joi.boolean().optional(),
  unit_id: Joi.string().allow("").optional(),
  unitId: Joi.string().allow("").optional(),
  ad_intervals: Joi.number().integer().min(0).optional(),
  adIntervals: Joi.number().integer().min(0).optional(),
  src: Joi.string().allow("", null).optional(),
  href: Joi.string().allow("", null).optional(),
  title: Joi.string().allow("", null).optional(),
  disabled: Joi.boolean().optional(),
};

export default class AdsController extends Controller {
  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        slot_type: Joi.string()
          .valid("splash", "banner", "custom", "list")
          .optional(),
        status: Joi.number().integer().valid(0, 1).optional(),
      }),
    );
    const data = await this.service.ai.ads.list(query);
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.ads.findOne(id);
    ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.validate({
      body: {
        slot_type: Joi.string()
          .valid("splash", "banner", "custom", "list")
          .required(),
        ...slotBody,
      },
    });
    const data = await this.service.ai.ads.create(body);
    ctx.respond(data, null, "创建成功");
  }

  async update(ctx) {
    const body = ctx.validate({
      body: {
        id: Joi.number().integer().required(),
        ...slotBody,
      },
    });
    const data = await this.service.ai.ads.update(body);
    ctx.respond(data, null, "更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.ai.ads.delete(id);
    ctx.respond(data, data ? 0 : 1, data ? "已删除" : "操作失败");
  }

  async getSettings(ctx) {
    const data = await this.service.ai.ads.getSettings();
    ctx.respond(data);
  }

  async updateSettings(ctx) {
    const body = ctx.validate({
      body: {
        splash_countdown: Joi.number().integer().min(1).max(60).optional(),
        default_point: Joi.number().integer().min(1).optional(),
      },
    });
    const data = await this.service.ai.ads.updateSettings(body);
    ctx.respond(data, null, "保存成功");
  }
}
