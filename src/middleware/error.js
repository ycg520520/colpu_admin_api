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
      let code = error.status, message = error.message, status = ctx.status;
      console.error(code, message, status);
      if (message) {
        ctx.body = ctx.respond(undefined, code, message);
        ctx.status = status;
      } else {
        ctx.throw(error);
      }
    }
  };
}
