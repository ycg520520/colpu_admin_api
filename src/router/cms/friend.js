/**
 * @Author: colpu
 * @Date: 2025-12-18 21:19:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 16:52:18
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const friend = controller.cms.friend;
  router.get("/friend/list", verify, friend.list);
  router.get('/friend', verify, friend.findOne);
  router.post('/friend', verify, friend.create);
  router.put('/friend', verify, friend.update);
  router.delete('/friend', verify, friend.delete);
};
