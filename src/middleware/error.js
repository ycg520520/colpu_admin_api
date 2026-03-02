/**
 * @Author: colpu
 * @Date: 2025-11-12 23:52:49
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-19 11:42:14
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

/**
 * 全局错误处理中间件
 * 捕获下游中间件/路由抛出的错误，统一格式化为 respond 响应体并设置 ctx.status
 */
// import { colorConsole } from '../utils/color-console.js';
const IS_DEV = process.env.NODE_ENV === 'development'
// 生产环境配置
// if (IS_DEV) {
//   colorConsole.updateConfig({
//     logLevel: 'error', // 只显示错误
//     showIcons: true   // 显示图标
//   });
// }

export default () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      const rawStatus = error?.status;
      const message = error?.message;

      // 约定：
      // - HTTP 错误（100-599）：HTTP 状态码与业务 status 保持一致
      // - 业务错误（>=10000）：HTTP 返回 200，业务 status 使用业务码
      // - 其它未知错误：HTTP 500
      let httpStatus = 500;
      let bizStatus = 500;
      if (typeof rawStatus === "number") {
        if (rawStatus >= 10000) {
          httpStatus = 200;
          bizStatus = rawStatus;
        } else if (rawStatus >= 100 && rawStatus <= 599) {
          httpStatus = rawStatus;
          bizStatus = rawStatus;
        } else {
          // 例如：rawStatus=0/1 等，作为业务状态码返回
          httpStatus = 200;
          bizStatus = rawStatus;
        }
      }

      // 记录错误日志
      console.error(rawStatus, message, error);

      if (message) {
        ctx.respond(undefined, bizStatus, message);
        ctx.status = httpStatus;
        return;
      }

      // 无 message 的错误，继续抛给 Koa 默认处理
      ctx.status = httpStatus;
      ctx.throw(error);
    }
  };
}
