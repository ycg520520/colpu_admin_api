/**
 * @Author: colpu
 * @Date: 2026-04-30 13:08:06
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-19 00:49:36
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class ClassifyExtendController extends Controller {
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
}
