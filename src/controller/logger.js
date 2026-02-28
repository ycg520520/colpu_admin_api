/**
 * @Author: colpu
 * @Date: 2026-01-17 15:16:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-19 16:16:14
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class LogsController extends Controller {
  async list(ctx) {
    const params = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.logs.list(params);
    return ctx.respond(data);
  }
}
