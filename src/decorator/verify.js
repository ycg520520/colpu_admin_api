/**
 * @Author: colpu
 * @Date: 2023-08-09 23:43:44
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-25 17:16:35
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

/**
 * JWT Token 验证中间件
 * 从 Authorization 头解析 Bearer Token，调用 auth._verify 验证并将用户信息写入 ctx.state.user
 * @param {Object} ctx Koa 上下文
 * @param {Function} next 下一个中间件
 * @throws {401} 未提供 token 或 token 无效
 */
export default async function verify(ctx, next) {
  // const jwtConf = ctx.app.config.jwt || {};

  const authorization =
    ctx.get("Authorization") || ctx.get("authorization") || "";
  const accessToken = authorization.split(" ")[1];
  if (!accessToken) {
    ctx.throw(401, "No access_token provided"); // 未提供令牌
  }

  try {
    // 方法1: 本地验证 (需要共享密钥)，对于多客服端不适用
    // ctx.state.user = jwt.verify(accessToken, jwtConf.secret);

    // 方法2: 调用本地控制器，优化请求，适用于接口在同一服务上
    // const user = await controller.auth._verifyToken(ctx);
    // ctx.state.user = user;

    // 方法3: 远程验证 (更安全)
    // const user = await ctx.app.$http.get(`http://127.0.0.1:8610/api/verify`, {
    //   headers: { Authorization: authorization },
    //   params: ctx.query,
    // }).catch(err => {
    //   console.log(err);
    // });

    // 方法4: 本服务直接调用控制器方法 (最高效, 更安全)
    const user = await ctx.app.controller.auth._verifyToken(ctx);
    ctx.state.user = user;
  } catch (error) {
    ctx.throw(401, error.message || "Invalid token");
  }
  await next();
};
