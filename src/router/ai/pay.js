/**
 * @Author: colpu
 * @Date: 2026-06-09 15:35:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 15:46:31
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
  const { pay } = controller.ai;
  router.get("/pay/recharge/packages", pay.packages);
  router.get("/pay/recharge/invite-summary", pay.inviteSummary);
  router.get("/pay/recharge/invite-for-order", verify, pay.inviteForOrder);
  router.post("/pay/recharge/create", verify, pay.createRecharge);
  useChildRouter(router);
};
