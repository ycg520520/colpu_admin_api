/**
 * @Author: colpu
 * @Date: 2026-01-16 15:26:13
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-03 23:00:06
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const frags = controller.cms.frags;
  router.get("/frags/list", verify, frags.list);
  router.get('/frags', verify, frags.findOne);
  router.post('/frags', verify, frags.create);
  router.put('/frags', verify, frags.update);
  router.delete('/frags', verify, frags.delete);
};
