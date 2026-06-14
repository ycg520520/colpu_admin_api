/**
 * @Author: colpu
 * @Date: 2026-06-09 15:27:38
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 17:31:11
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/ai" });
  const { stats } = controller.ai;
  router.get("/admin/stats/overview", verify, stats.overview);
  router.get("/admin/stats/trend", verify, stats.trend);
  useChildRouter(router);
};
