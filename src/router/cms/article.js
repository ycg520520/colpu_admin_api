/**
 * @Author: colpu
 * @Date: 2025-12-15 21:15:32
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 16:51:24
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const article = controller.cms.article;
  router.get("/article/list", verify, article.list);
  router.get('/article', verify, article.findOne);
  router.post('/article', verify, article.create);
  router.put('/article', verify, article.update);
  router.delete('/article', verify, article.delete);
};
