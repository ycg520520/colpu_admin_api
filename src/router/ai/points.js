/**
 * @Author: colpu
 * @Date: 2026-05-14
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/ai" });
  const { points, pay } = controller.ai;
  router.get("/points/logs", verify, points.logs);
  router.get("/points/recharge-orders", verify, points.rechargeOrders);

  router.get("/admin/points/logs", verify, points.list);
  router.post("/admin/points/refund-consume", verify, points.refundConsume);

  useChildRouter(router);
};
