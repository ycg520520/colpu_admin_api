/**
 * @Author: colpu
 * @Date: 2026-01-14 16:51:31
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 16:14:49
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const sites = controller.cms.sites;
  router.get('/site', verify, sites.find);
  router.post('/site', verify, sites.create);
  router.put('/site', verify, sites.update);
};
