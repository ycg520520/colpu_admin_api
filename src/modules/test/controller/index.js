/**
 * @Author: colpu
 * @Date: 2026-03-08 22:22:07
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-08 23:17:38
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved. 
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 测试控制器
 */
export default class TestController extends Controller {
  async index(ctx) {
    const serve = this.service.test;
    const body = await serve.test.find();
    // ctx.respond(body);
    ctx.body = body;
  }
}