/**
 * @Author: colpu
 * @Date: 2025-11-22 19:52:22
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:16:55
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const post = controller.post;
  router.get("/post/list", verify, post.list);

  router.get('/post', verify, post.findOne);
  router.post('/post', verify, post.create);
  router.put('/post', verify, post.update);
  router.delete('/post', verify, post.delete);
};
