/**
 * @Author: colpu
 * @Date: 2023-08-09 23:43:44
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-01 21:22:19
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
// import jwt from "jsonwebtoken";
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
    // const user = await controller.auth._verify(ctx);
    // ctx.state.user = user;

    // 方法3: 远程验证 (更安全)
    // const user = await ctx.app.$http.get(`http://127.0.0.1:8610/api/verify`, {
    //   headers: { Authorization: authorization },
    //   params: ctx.query,
    // }).catch(err => {
    //   console.log(err);
    // });

    // 方法4: 本服务直接调用控制器方法 (最高效, 更安全)
    const user = await ctx.app.controller.auth._verify(ctx);
    ctx.state.user = user;
  } catch (error) {
    ctx.throw(401, error.message || "Invalid token");
  }
  await next();
};
