/**
 * @Author: colpu
 * @Date: 2026-02-09 21:50:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-07 12:55:45
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const category = controller.category;
  router.get("/category/tree", verify, category.tree);
  router.get("/category/all", verify, category.all);
  router.get("/category/list", verify, category.list);
  router.get('/category', verify, category.findOne);
  router.post('/category', verify, category.create);
  router.put('/category', verify, category.update);
  router.delete('/category', verify, category.delete);
};
