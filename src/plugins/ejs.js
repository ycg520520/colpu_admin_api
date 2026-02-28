/**
 * @Author: colpu
 * @Date: 2023-02-08 20:39:24
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-09-17 16:10:01
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import ejs from "@koa/ejs";
import path from "path";
export default (app) => {
  const { config } = app;
  ejs(app, {
    root: path.resolve(config.root, `src/view/${config.theme || ""}`),
    layout: undefined,
    viewExt: "html",
    async: true,
    cache: false,
    debug: false,
  });
};
