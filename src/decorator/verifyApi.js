/**
 * @Author: colpu
 * @Date: 2025-11-21 13:13:50
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-01 21:22:58
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

import { users, permissions } from "../models/sys/index.js";
// API权限检查中间件
export default async function verifyApi(ctx, next) {
  try {
    const { uid } = ctx.state.user;
    const user = await users.findOne({ where: { uid } });
    if (!user) {
      ctx.throw(403, "用户不存在");
    }
    const method = ctx.method;
    const url = ctx.request.path;

    // 查找匹配的API权限
    const hasPermission = user.Roles.some(role =>
      role.Permissions.some(perm =>
        perm.type === 'api' &&
        perm.method === method &&
        url.startsWith(perm.url)
      )
    );
    if (!hasPermission) {
      ctx.throw(403, "没有权限访问该API");
    }

    await next();
  } catch (error) {
    ctx.throw(500, "权限检查失败");
  }
};
