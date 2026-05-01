/**
 * @Author: colpu
 * @Date: 2026-03-30 10:19:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-10 10:02:18
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import pollTasker from '../../utils/ai/task-poller.js';

// 图片超分，图片放大
export default class ImageSuperController extends Controller {
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
  async generate(ctx) {
    const body = ctx.validate({
      body: {
        imageUrl: Joi.string().required(), // 图片
        scale: Joi.number().default(2), // 缩放比例
        outputFormat: Joi.string().default('png'), // 输出图片格式，支持png、jpg、webp
        outputQuality: Joi.number().default(95), // 输出质量
        userData: Joi.string().default(''), // 用户自定义数据，原样返回
      },
    });
    let res
    try {
      res = await pollTasker.viapi.generateSuperResolutionImage(body);
    } catch (err) {
      ctx.throw(500, err.message)
    }
    const { task_id, task_type } = res;
    const { uid } = ctx.state.user || {};
    const data = {
      uid,
      original_images: ['upload/' + body.imageUrl.split('upload/').pop()],
      ...res
    }
    const createRes = await this.service.ai.ai.create(data);
    pollTasker.add([{
      task_id, task_type
    }]);
    ctx.respond(createRes);
  }
  async make(ctx) {
    const body = ctx.validate({
      body: {
        url: Joi.string().required(), // 图片
        upscaleFactor: Joi.number().default(2), // 缩放比例
        outputFormat: Joi.string().default('png'), // 输出图片格式，支持png、jpg、webp
        outputQuality: Joi.number().default(95), // 输出质量
      },
    });;
    let res
    try {
      res = await pollTasker.viapi.makeSuperResolutionImage(body);
    } catch (err) {
      ctx.throw(500, err.message)
    }
    const { uid } = ctx.state.user || {};
    const data = {
      uid,
      original_images: ['upload/' + body.url.split('upload/').pop()],
      ...res
    }
    const createRes = await this.service.ai.ai.create(data);
    ctx.respond(createRes);
  }
}
