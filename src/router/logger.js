/**
 * @Author: colpu
 * @Date: 2026-01-17 15:16:55
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-19 16:19:47
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const logs = controller.logger;
  router.get("/log/list", verify, logs.list);
};
