/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 16:59:59
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router, root, env, config} = app;
  const index = controller.index;
  router.prefix('/api')
  router.get("/", index.secret);
  router.all("/test", verify, index.test);
  router.all("/callback", index.callback);
  router.get("/user/party", index.party);
};
