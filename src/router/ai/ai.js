/**
 * @Author: colpu
 * @Date: 2026-03-30 09:41:58
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-09 09:26:22
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { ai } = controller;
  router.post("/image/repair", verify, ai.imageRepair.repair);
  router.post("/image/generateSuper", verify, ai.imageSuper.generate);
  router.post("/image/makeSuper", verify, ai.imageSuper.make);
  router.post("/image/color", verify, ai.imageColor.color);
  router.post("/image/colorize", verify, ai.imageColor.colorize);
  useChildRouter(router);
};
