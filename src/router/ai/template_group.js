/**
 * @Author: colpu
 * @Date: 2026-06-09 15:27:38
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-13 09:26:00
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * @Author: colpu
 * @Date: 2026-05-19 00:25:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 15:26:44
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/ai" });
  const { templateGroup } = controller.ai;
  router.get("/template_group", verify, templateGroup.all);
  router.get("/template_group/:id", verify, templateGroup.findOne);
  router.post("/template_group", verify, templateGroup.create);
  router.put("/template_group", verify, templateGroup.update);
  router.delete("/template_group/:id", verify, templateGroup.delete);
  useChildRouter(router);
};
