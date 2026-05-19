/**
 * @Author: colpu
 * @Date: 2026-04-09 09:26:41
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-19 00:30:59
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { ai } = controller;
  router.get("/classify", ai.classify.list);
  router.get("/skill", ai.classifyExtend.all); // 兼容第一个版本
  router.get("/classify/extend", ai.classifyExtend.all);
  router.get("/classify/:id", ai.classify.findOneById);
  useChildRouter(router);
};
