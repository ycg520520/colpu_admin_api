/**
 * @Author: colpu
 * @Date: 2026-04-09 09:26:41
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-30 13:19:50
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { ai } = controller;
  router.get("/classify", ai.classify.list);
  router.get("/classify/extend", ai.classifyExtend.all);
  router.get("/classify/:id", ai.classify.findOneById);
  useChildRouter(router);
};
