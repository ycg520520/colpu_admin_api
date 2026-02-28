/**
 * @Author: colpu
 * @Date: 2025-11-30 10:02:52
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:36:59
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const perm = controller.permission;
  router.get("/permission/list", verify, perm.list);

  router.get('/permission', verify, perm.findOne);
  router.post('/permission', verify, perm.create);
  router.put('/permission', verify, perm.update);
  router.delete('/permission', verify, perm.delete);
  router.get('/permission/tree', verify, perm.tree);
  router.post('/permission/give', verify, perm.give);

  router.get("/permission/users", verify, perm.permUsers);
};
