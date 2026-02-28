/**
 * @Author: colpu
 * @Date: 2025-11-30 10:02:52
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 21:15:25
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const classify = controller.cms.classify;
  router.get("/classify/all", verify, classify.all);
  router.get("/classify/tree", verify, classify.tree);
  router.get("/classify/list", verify, classify.list);

  router.get('/classify', verify, classify.findOne);
  router.post('/classify', verify, classify.create);
  router.put('/classify', verify, classify.update);
  router.delete('/classify', verify, classify.delete);
};
