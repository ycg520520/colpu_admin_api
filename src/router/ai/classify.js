/**
 * @Author: colpu
 * @Date: 2026-04-09 09:26:41
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-13 21:25:34
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { classify, classifyExtend } = controller.ai;
  router.get("/classify", classify.all);
  router.get("/classify/tree", classify.tree);
  router.get("/skill", classifyExtend.all); // 兼容第一个版本
  router.get("/classify/extend", classifyExtend.all);
  router.get("/classify/:id", classify.findOne);

  router.get("/admin/classify/list", verify, classify.list);
  router.post("/admin/classify", verify, classify.create);
  router.put("/admin/classify", verify, classify.update);
  router.delete("/admin/classify/:id", verify, classify.delete);
  useChildRouter(router);
};
