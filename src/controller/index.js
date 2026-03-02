/**
 * @Author: colpu
 * @Date: 2025-10-11 11:13:07
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-30 15:31:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";

/**
 * 首页控制器，提供基础 API 与回调接口
 */
export default class IndexController extends Controller {
  /**
   * @api {get} /
   * @apiName secret
   * @apiDescription 获取密钥配置页面
   * @apiGroup Index
   * @apiVersion 1.0.0
   * @apiSuccess {String} HTML 返回密钥配置页面
   */
  secret(ctx) {
    return ctx.render("secret_key");
  }

  /**
   * @api {all} /test
   * @apiName test
   * @apiDescription 测试接口，需 Token 验证
   * @apiGroup Index
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Object} data 测试返回数据
   */
  async test(ctx) {
    const data = await this.service.user.test({});
    return ctx.respond(data);
  }

  /**
   * @api {all} /callback
   * @apiName callback
   * @apiDescription 回调接口，返回应用配置
   * @apiGroup Index
   * @apiVersion 1.0.0
   * @apiSuccess {Object} config 应用配置信息
   */
  callback(ctx) {
    ctx.respond(ctx.app.config);
  }

  /**
   * @api {get} /user/party
   * @apiName party
   * @apiDescription 获取岗位与角色列表（用于表单选择等）
   * @apiGroup Index
   * @apiVersion 1.0.0
   * @apiSuccess {Array} posts 岗位列表
   * @apiSuccess {Array} roles 角色列表
   */
  async party(ctx) {
    const posts = await this.service.post.getPostAll();
    const roles = await this.service.roles.roleAll();
    ctx.respond({ posts, roles });
  }
}
