/**
 * @Author: colpu
 * @Date: 2025-10-11 22:22:56
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-30 09:04:13
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router,
  } = app;
  const auth = controller.auth;
  router.get("/verify", auth.verify);
  router.get("/auth", auth.authorize);
  router.post("/token", auth.token);
  router.post("/login", verify, auth.login);
  router.post("/logout", verify, auth.logout);
};
