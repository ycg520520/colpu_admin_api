/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-08 16:30:05
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
// 一个功能齐全的body解析器中间件。支持multipart、urlencoded和json请求体。
// import { koaBody } from "koa-body";
import { bodyParser } from "@koa/bodyparser";
import compress from "koa-compress"; // 引入gzip压缩中间件
import cacheControl from "koa-cache-control"; // 引入缓存控制中间件
import helmet from "koa-helmet"; // 引入xss过滤中间件
import cookie from "koa-cookie"; // 引入客户端cookie解析中间件
import cors from "@koa/cors"; // 引入跨域中间件
import session from "../utils/session-redis.js"; // 引入session中间件
import * as utils from '../utils/index.js';
import respond from '../utils/respond/index.js';
export default (app) => {
  const { config } = app;
  const appConfig = config.appConfig || {};
  app.keys = appConfig.keys || ["colpu-session-secret-2025"];
  app.context.utils = utils;
  app.proxy = true;
  // 跨域
  if (config.cors) {
    app.use(cors(config.cors));
  }
  // XSS过滤
  app.use(
    helmet.xssFilter(
      Object.assign(
        {
          setOnOldIE: true,
        },
        config.xss
      )
    )
  );

  // gzip压缩
  app.use(
    compress(
      Object.assign(
        {
          threshold: 1024,
          flush: import("zlib").Z_SYNC_FLUSH,
        },
        config.compress
      )
    )
  );

  // 缓存控制
  app.use(
    cacheControl(
      Object.assign(
        {
          public: "public",
        },
        config.cache
      )
    )
  );

  // session配置
  if (config.session) {
    app.use(session(app, config.session));
  }
  app.use(cookie.default());
  // app.use(koaBody());
  app.use(bodyParser());

  respond(app);
};
