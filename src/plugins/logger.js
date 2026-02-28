/**
 * @Author: colpu
 * @Date: 2026-01-17 11:15:15
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-09 21:44:30
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { logger } from '../models/sys/index.js';
function saveLogger(ctx) {
  const user = ctx.session.user || {};
  logger.create({
    uid: user.uid || 'guest',
    username: user.username || 'guest',
    url: ctx.path,
    method: ctx.method,
    status: ctx.status,
    details: {
      body: ctx.request.body,
      query: ctx.query,
      params: ctx.params,
    },
    ip: ctx.ip,
    user_agent: ctx.header['user-agent'] || ''
  });
};

export default (app) => {
  // const mothods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  const mothods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  const auditRoutes = ['/api/token', '/api/user/info'];
  app.use(async (ctx, next) => {
    await next();
    // 记录日志，只记录修改创建类请求，以及登录请求
    if ((mothods.includes(ctx.method) || auditRoutes.includes(ctx.path)) && ctx.session.user) {
      saveLogger(ctx);
    }
  })
}
