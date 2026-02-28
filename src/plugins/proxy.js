/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-03-29 22:48:08
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import koaProxies from 'koa-proxies';

export default (app) => {
  const { proxy } = app.config;
  if (proxy) {
    for (let k in proxy) {
      app.use(koaProxies(k, proxy[k]));
    }
  }
};
