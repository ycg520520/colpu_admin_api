/**
 * @Author: colpu
 * @Date: 2025-10-11 11:13:07
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-30 15:31:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
export default class IndexController extends Controller {
  secret(ctx) {
    return ctx.render("secret_key");
  }
  async test(ctx) {
    const data = await this.service.user.test({});
    return ctx.respond(data);
  }

  callback(ctx) {
    ctx.respond(ctx.app.config);
  }

  async party(ctx) {
    const posts = await this.service.post.getPostAll();
    const roles = await this.service.roles.roleAll();
    ctx.respond({ posts, roles });
  }
}
