/**
 * @Author: colpu
 * @Date: 2025-11-16 19:59:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:29:20
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const departments = controller.departments;
  router.get("/department/tree", verify, departments.tree);
  router.get("/department/list", verify, departments.list);

  router.get('/department', verify, departments.findOne);
  router.post('/department', verify, departments.create);
  router.put('/department', verify, departments.update);
  router.delete('/department', verify, departments.delete);
};
