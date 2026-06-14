/**
 * @Author: colpu
 * @Date: 2026-05-19 00:25:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 15:26:44
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * @Author: colpu
 * @Date: 2026-05-14
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/ai" });
  const { template } = controller.ai;
  router.get("/template/list", verify, template.list);
  router.get("/template/:id", verify, template.findOne);
  router.post("/template", verify, template.create);
  router.put("/template", verify, template.update);
  router.delete("/template/:id", verify, template.delete);
  useChildRouter(router);
};
