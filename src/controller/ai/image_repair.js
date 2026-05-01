/**
 * @Author: colpu
 * @Date: 2026-03-26 14:39:44
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-24 21:59:42
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import pollTasker from '../../utils/ai/task-poller.js';

// 图片修复，老照片修复
export default class ImageRepairController extends Controller {
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
  async repair(ctx) {
    const { images, prompt, model = 'wan2.6-image' } = ctx.validate({
      body: {
        images: Joi.array().items(Joi.string()).required(), // 图片
        prompt: Joi.string(), // 提示词
        parameters: Joi.object(),
      },
    });
    let res;
    try {
      res = await pollTasker.bailian.generate({ model, images, prompt });
    } catch (err) {
      ctx.throw(500, err)
    }
    const { uid } = ctx.state.user || {};
    const { task_id, task_type, ...reset } = res;
    const data = {
      uid,
      original_images: images.map((image) => 'upload/' + image.split('upload/').pop()),
      task_id, task_type,
      ...reset
    }
    const createRes = await this.service.ai.ai.create(data);
    pollTasker.add([{
      task_id,
      task_type
    }])
    ctx.respond(createRes);
  }
};
