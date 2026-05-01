/**
 * @Author: colpu
 * @Date: 2026-03-29 15:50:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-30 16:36:57
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import pollTasker from '../../utils/ai/task-poller.js';
import skillData from '../../config/skill.js';
import { GoogleGenAI } from "@google/genai";
export default class IndexController extends Controller {
  async index(ctx) {
    ctx.respond({
      cdn: this.config.ali.default.domain,
      splash: {
        src: "static/flash/flash2.webp",
        href: 'https://www.bailian-ai.com/flash'
      },
      ad: {
        banner: {
          src: "static/ad/banner.png",
          href: ''
        },
        list: [
          {
            src: "static/ad/colorize.png",
            href: 'pages/upload/index?id=16&model=colorizeImage',
            title: '黑白上色',
          },
          {
            src: "static/ad/image_video.png",
            href: 'pages/upload/index?id=17&model=wan2.6-image',
            title: '照片转视频'
          }
        ]
      },
      skill_classify: skillData.reduce((acc, item) => {
        acc[item.model] = item.name;
        return acc;
      }, {})
    });
  }

  async skill(ctx) {
    ctx.respond(skillData);
  }

  async update(ctx) {
    console.log(ctx.request.body)
    const {
      task_id,
      output,
      task_status, images } = ctx.validate({
        body: {
          task_id: Joi.string().required(),
          output: Joi.object(),
          task_status: Joi.string(),
          images: Joi.array().items(Joi.string()),
        },
      });
    try {
      const data = await this.service.ai.ai.update({
        task_id,
        output,
        task_status,
        images
      });
      ctx.respond(data, null, '更新成功');
    } catch (error) {
      console.log('update error==>', error);
      ctx.throw(error)
    }
  }

  // 轮询所有任务
  async pollAllTask(ctx) {
    const { aikeys, ali } = this.config;
    pollTasker.init({
      apikey: aikeys.ali_bailian,
      updateTaskUrl: `http://127.0.0.1:8610/api/ai/task`,
      ossOption: ali.default
    });
    const tasks = await this.service.ai.ai.getTasks();
    if (!tasks) {
      ctx.throw(404, '任务不存在');
    }
    pollTasker.add(tasks)
  }

  async list(ctx) {
    const query = ctx.validate(ctx.utils.schemaPagination());
    const { uid } = ctx.state.user || {};
    if (!uid) {
      ctx.throw(401, '请先登录');
    }
    const data = await this.service.ai.ai.list({ uid, ...query });
    return ctx.respond(data);
  }
  async detail(ctx) {
    const { id } = ctx.validate({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.ai.ai.findOne(id);
    return ctx.respond(data);
  }

  async generate(ctx) {

  }

  async test(ctx) {
    const ai = new GoogleGenAI({
      apiKey: this.config.aikeys.gemini,
    });
    console.log('ai==>', this.config.aikeys.gemini);
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      input: {
        content: [
          { type: 'input_text', text: '请用中文介绍一下自己' },
        ],
      },
    });
    console.log(response);
    ctx.respond(response.text);
  }
}
