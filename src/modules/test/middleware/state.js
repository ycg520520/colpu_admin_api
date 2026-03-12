/**
 * @Author: colpu
 * @Date: 2025-10-18 09:06:16
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-08 22:40:09
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default (app, options) => {
  const { config } = app
  return (ctx, next) => {
    console.log('这是一个测试中间件');
    return next();
  };
};

