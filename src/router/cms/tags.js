/**
 * @Author: colpu
 * @Date: 2025-12-18 21:19:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 16:51:29
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const tags = controller.cms.tags;
  router.get("/tags/all", verify, tags.all);
  router.get("/tags/list", verify, tags.list);
  router.get('/tags', verify, tags.findOne);
  router.post('/tags', verify, tags.create);
  router.put('/tags', verify, tags.update);
  router.delete('/tags', verify, tags.delete);
};
