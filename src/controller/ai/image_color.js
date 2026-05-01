/**
 * @Author: colpu
 * @Date: 2026-03-30 10:19:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-10 10:02:43
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import pollTasker from '../../utils/ai/task-poller.js';

// 图片上色、老照片上色
export default class ImageColorController extends Controller {
  constructor(ctx) {
    super(ctx);
    const { ali, aikeys } = this.config;
    if (!ali.default || !aikeys.ali_bailian) {
      return ctx.respond(null, 1, "服务端未找到配置");
    }
    pollTasker.init({
      apikey: aikeys.ali_bailian,
      updateTaskUrl: `http://127.0.0.1:8610/api/ai/task`,
      ossOption: ali.default
    });
  }
  async color(ctx) {
    const body = ctx.validate({
      body: {
        imageUrl: Joi.string().required(), // 图片
      },
    });
    let res
    try {
      res = await pollTasker.viapi.enhanceImageColor(body);
    } catch (err) {
      ctx.throw(500, err.message)
    }
    const { uid } = ctx.state.user || {};
    const data = {
      uid,
      original_images: ['upload/' + body.imageUrl.split('upload/').pop()],
      ...res
    }
    const createRes = await this.service.ai.ai.create(data);
    ctx.respond(createRes);
  }

  async colorize(ctx) {
    const body = ctx.validate({
      body: {
        imageUrl: Joi.string().required(), // 图片
      },
    });
    let res
    try {
      res = await pollTasker.viapi.colorizeImage(body);
    } catch (err) {
      ctx.throw(500, err.message)
    }
    const { uid } = ctx.state.user || {};
    const data = {
      uid,
      original_images: ['upload/' + body.imageUrl.split('upload/').pop()],
      ...res
    }
    const createRes = await this.service.ai.ai.create(data);
    ctx.respond(createRes);
  }
}
