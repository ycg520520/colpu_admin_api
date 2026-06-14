/**
 * @Author: colpu
 * @Date: 2026-06-09 15:28:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 20:17:25
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { classifyExtend } = controller.ai;

  router.get("/admin/classify_extend/list", verify, classifyExtend.list);
  router.get("/admin/classify_extend/:id", verify, classifyExtend.findOne);
  router.post("/admin/classify_extend", verify, classifyExtend.create);
  router.put("/admin/classify_extend", verify, classifyExtend.update);
  router.delete("/admin/classify_extend/:id", verify, classifyExtend.delete);
  useChildRouter(router);
};
