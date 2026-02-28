/**
 * @Author: colpu
 * @Date: 2025-10-11 22:22:56
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-14 13:33:12
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default (app) => {
  const { controller, router } = app;
  const wechat = controller.wechat;
  router.get("/wechat/access_token", wechat.getAccessToken);
  router.get("/wechat/qrcode", wechat.qrcode);
  router.get("/wechat/callback", wechat.callback);
};
