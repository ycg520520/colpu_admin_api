/**
 * @Author: colpu
 * @Date: 2026-01-14 21:51:19
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-09 17:14:16
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const spider = controller.cms.spider;
  router.get("/spider/list", verify, spider.list);
  router.get('/spider', verify, spider.findOne);
  router.post('/spider', verify, spider.create);
  router.put('/spider', verify, spider.update);
  router.delete('/spider', verify, spider.delete);
  router.get('/spider/auto', verify, spider.autoSpider);
  router.get('/spider/schedule', verify, spider.spiderSchedule);
  router.post('/spider/schedule', verify, spider.spider);
};
