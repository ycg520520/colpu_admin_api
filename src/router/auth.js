/**
 * @Author: colpu
 * @Date: 2025-10-11 22:22:56
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 10:10:21
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
  router.get("/token", auth.token);
  router.post("/token", auth.token);
  /** 登录：短信验证码 / 三方 OAuth / 会话 */
  router.post("/sms/send", auth.sendSms);
  router.get("/oauth/:provider/start", auth.oauthStart);
  router.get("/oauth/poll", auth.oauthPoll);
  router.get("/oauth/:provider/callback", auth.oauthCallback);
  router.post("/login", verify, auth.login);
  router.post("/logout", verify, auth.logout);
};
