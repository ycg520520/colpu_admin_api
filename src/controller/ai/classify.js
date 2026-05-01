/**
 * @Author: colpu
 * @Date: 2026-03-29 15:50:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-30 13:18:30
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class ClassifyController extends Controller {
  async list(ctx) {
    const query = ctx.validate({
      query: {
        name: Joi.string().optional(),
      }
    })
    const res = await this.service.ai.classify.all(query);
    ctx.respond(res);
  }
  async findOneById(ctx) {
    const { id } = ctx.validate({
      params: {
        id: Joi.string().required(),
      }
    })
    const res = await this.service.ai.classify.findOneById(id);
    ctx.respond(res);
  }
}
