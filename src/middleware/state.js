/**
 * @Author: colpu
 * @Date: 2025-10-18 09:06:16
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-22 17:01:39
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default (app, options) => {
  const { config } = app
  return (ctx, next) => {
    ctx.state.siteConf = config;
    ctx.state.utils = ctx.utils;
    ctx.utils = ctx.utils;
    ctx.state.protocol = ctx.protocol;
    return next();
  };
};

