/**
 * @Author: colpu
 * @Date: 2026-03-04 11:19:04
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-08 23:03:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved. 
 */
export default (app) => {
  const { config } = app;
  app.use(async (ctx, next) => {
    console.log('模块插件测试');
    await next();
  })
};
