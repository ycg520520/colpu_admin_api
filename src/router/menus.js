/**
 * @Author: colpu
 * @Date: 2025-11-14 12:04:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:30:41
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const menus = controller.menus;
  router.get("/routes", verify, menus.routes);
  router.get("/menus/all", verify, menus.all);
  router.get("/menus/tree", verify, menus.tree);

  router.get('/menus', verify, menus.findOne);
  router.post('/menus', verify, menus.create);
  router.put('/menus', verify, menus.update);
  router.delete('/menus', verify, menus.delete);
};
