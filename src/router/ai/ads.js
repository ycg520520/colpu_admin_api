/**
 * @Author: colpu
 * @Date: 2026-06-09 15:21:47
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 17:34:17
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * 运营后台 AI：/api/admin/ai/*
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/ai" });
  const { ads } = controller.ai;
  router.get("/ads", verify, ads.list);
  router.get("/ads/settings", verify, ads.getSettings);
  router.put("/ads/settings", verify, ads.updateSettings);
  router.get("/ads/:id", verify, ads.findOne);
  router.post("/ads/", verify, ads.create);
  router.put("/ads/", verify, ads.update);
  router.delete("/ads/:id", verify, ads.delete);
  useChildRouter(router);
};
