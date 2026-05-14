/**
 * @Author: colpu
 * @Date: 2026-03-29 15:50:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-13 14:21:00
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import TaskPoller from '../../ai/task-poller.js';
import aiGenerate from "../../ai/index.js";
import { progressStatus } from "../../ai/utils.js";
import { GoogleGenAI } from "@google/genai";
export default class IndexController extends Controller {
  constructor(ctx) {
    super(ctx);
    const { ali } = this.config;
    if (!ali?.default) {
      return;
    }
    this.poller = new TaskPoller(this.config);
  }

  async getConfig(ctx) {
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
            href: "pages/upload/index?id=18",
            title: "黑白上色",
          },
          {
            src: "static/ad/image_video.png",
            href: "pages/upload/index?id=15",
            title: "照片转视频",
          },
        ]
      },
    });
  }

  async update(ctx) {
    console.log(ctx.request.body)
    const {
      task_id,
      output,
      task_status, images, progress, status, message, is_real_progress } = ctx.validate({
        body: {
          task_id: Joi.string().required(),
          output: Joi.object(),
          task_status: Joi.string(),
          images: Joi.array().items(Joi.string()),
          progress: Joi.number().min(0).max(100),
          status: Joi.string(),
          message: Joi.string(),
          is_real_progress: Joi.boolean(),
        },
      });
    try {
      const data = await this.service.ai.records.update({
        task_id,
        output,
        task_status,
        images
      });
      await this.service.ai.payload.upsertByTaskId({
        task_id,
        record_id: data.id,
        output: output || {},
        progress: progress ?? (task_status === 'SUCCEEDED' ? 100 : undefined),
        status,
        message,
        is_real_progress: is_real_progress ?? false,
      });
      ctx.respond(data, null, '更新成功');
    } catch (error) {
      console.log('update error==>', error);
      ctx.throw(error)
    }
  }

  // 轮询所有任务
  async pollAllTask(ctx) {
    const { ali } = this.config;
    if (!ali?.default) {
      ctx.throw(500, "OSS 未配置");
    }
    if (!this.poller) {
      ctx.throw(500, "TaskPoller 未初始化（检查 Controller 构造是否因缺少 OSS 提前返回）");
    }
    const tasks = await this.service.ai.records.getTasks();
    if (!tasks) {
      ctx.throw(404, '任务不存在');
    }
    this.poller.add(tasks);
  }

  async list(ctx) {
    const query = ctx.validate(ctx.utils.schemaPagination());
    const { uid } = ctx.state.user || {};
    const data = await this.service.ai.records.list({ uid, ...query });
    return ctx.respond(data);
  }
  async detail(ctx) {
    const { id } = ctx.validate({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.ai.records.findOne(id);
    return ctx.respond(data);
  }

  async progress(ctx) {
    const { task_id } = ctx.validate({
      query: {
        task_id: Joi.string().required(),
      },
    });
    const progress = await this.service.ai.payload.getProgressByTaskId(task_id);
    if (!progress) {
      const task = await this.service.ai.records.findOneByTaskId(task_id);
      if (task) {
        const taskStatus = task.task_status;
        const fallback = {
          PENDING: { progress: 10, status: "PENDING", message: "任务排队中" },
          RUNNING: { progress: 30, status: "RUNNING", message: "任务处理中" },
          SUCCEEDED: { progress: 100, status: "SUCCEEDED", message: "任务完成" },
          FAILED: { progress: 100, status: "FAILED", message: "任务失败" },
          CANCELED: { progress: 100, status: progressStatus("CANCELED"), message: "任务已取消" },
          UNKNOWN: { progress: 0, status: progressStatus("UNKNOWN"), message: "等待中" },
        };
        const state = fallback[taskStatus] || fallback.UNKNOWN;
        return ctx.respond({
          task_id,
          ...state,
          is_real_progress: false,
        });
      }
      return ctx.respond({
        task_id,
        progress: 0,
        status: "PENDING",
        message: "任务排队中",
        is_real_progress: false,
      });
    }
    return ctx.respond(progress);
  }

  async generate(ctx) {
    const { uid } = ctx.state.user || {};
    const promptVariableItem = Joi.object({
      name: Joi.string().required(),
      value: Joi.string().allow("", null),
    }).unknown(true);
    const body = ctx.validate({
      allowUnknown: false,
      stripUnknown: true,
      body: {
        id: Joi.number().integer().required(),
        point: Joi.number().integer().required(),
        images: Joi.array().items(Joi.string()).default([]),
        prompt: Joi.string().allow("", null).optional(),
        prompt_variables: Joi.array().items(promptVariableItem).default([]),
        size: Joi.string().optional(),
        template: Joi.object().unknown(true).optional(),

        // ComfyUI 文生图等可选
        width: Joi.number().integer().min(64).max(4096).optional(),
        height: Joi.number().integer().min(64).max(4096).optional(),
        seed: Joi.number().integer().min(0).optional(),
        steps: Joi.number().integer().min(1).max(150).optional(),
        cfg: Joi.number().min(0).max(30).optional(),
        batch_size: Joi.number().integer().min(1).max(8).optional(),
        prompt_positive: Joi.string().allow("", null).optional(),
        prompt_negative: Joi.string().allow("", null).optional(),
        clip_text_by_node_id: Joi.object().pattern(Joi.string(), Joi.string().allow("")).optional(),

        // ComfyUI image_repair 等
        repair_hint: Joi.string().allow("", null).optional(),
        denoise: Joi.number().min(0).max(1).optional(),
        guidance: Joi.number().min(0).max(20).optional(),
        scale_to_length: Joi.number().integer().min(64).max(4096).optional(),

        // viapi 等扩展字段，按需开启
        scale: Joi.number().optional(),
        outputFormat: Joi.string().optional(),
        outputQuality: Joi.number().optional(),
        userData: Joi.string().allow("", null).optional(),
        upscaleFactor: Joi.number().optional(),
        mode: Joi.string().valid("fast", "quality").optional(),
      },
    });
    if (!this.poller?.clients) {
      ctx.throw(500, "AI 环境未初始化（通常因未配置 OSS，Controller 构造阶段已跳过）");
    }
    try {
      const classify = await this.service.ai.classify.findOne(body.id);
      if (!classify?.model) {
        ctx.throw(400, `分类 id=${body.id} 未配置 model`);
      }
      const generateRes = await aiGenerate(this.poller.clients, {
        body,
        uid,
        classify,
        ctx,
      });
      const recordRes = await this.service.ai.records.createRecordWithPayload(generateRes);
      if (recordRes.task_status === 'PENDING') {
        this.poller.add([{ task_id: generateRes.task_id, model: generateRes.model }]);
      }
      ctx.respond(recordRes);
    } catch (error) {
      console.error('generate error==>', error);
      const msg = error?.message || "AI 生成失败";
      const status = Number(error?.status ?? error?.statusCode);
      if (Number.isFinite(status) && status >= 400 && status < 600) {
        ctx.throw(status, msg);
      }
      ctx.throw(500, msg);
    }
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
