/**
 * @Author: colpu
 * @Date: 2026-01-14 16:51:31
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-16 15:25:48
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const notice = controller.cms.notice;
  router.get("/notice/list", verify, notice.list);
  router.get('/notice', verify, notice.findOne);
  router.post('/notice', verify, notice.create);
  router.put('/notice', verify, notice.update);
  router.delete('/notice', verify, notice.delete);
};
