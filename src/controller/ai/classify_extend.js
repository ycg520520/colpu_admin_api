/**
 * @Author: colpu
 * @Date: 2026-04-30 13:08:06
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-30 13:08:23
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class ClassifyExtendController extends Controller {
  async all(ctx) {
    const res = await this.service.ai.classifyExtend.all();
    ctx.respond(res);
  }
}
