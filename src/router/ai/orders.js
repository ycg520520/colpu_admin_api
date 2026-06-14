/**
 * @Author: colpu
 * @Date: 2026-06-09 15:32:30
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 17:30:07
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/ai" });
  const { orders } = controller.ai;
  router.get("/admin/orders", verify, orders.list);
  router.get("/admin/orders/:id", verify, orders.findOne);
  router.post("/admin/orders/:id/refund", verify, orders.refund);
  router.post("/admin/orders/:id/close", verify, orders.close);
  useChildRouter(router);
};
