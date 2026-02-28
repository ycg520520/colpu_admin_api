/**
 * @Author: colpu
 * @Date: 2026-01-22 16:40:15
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-26 19:07:32
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
*/
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const { web, cms } = controller;
  router.get("/web/menus", web.index.menus);
  router.get("/web/feature", web.index.feature);
  router.get("/web/site", web.index.site);

  router.get("/web/article", web.index.articleDetail);
  router.get("/web/article/list", web.index.articleList);
  router.get("/web/article/type", web.index.articleListByType);
  router.get("/web/article/tags", web.index.articleTags);
  router.get("/web/tag/article/list", web.index.tagArticleList);
  router.get("/web/user/info", verify, web.index.getUserInfo);
};
