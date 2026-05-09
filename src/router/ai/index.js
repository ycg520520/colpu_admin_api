/**
 * @Author: colpu
 * @Date: 2025-12-15 21:15:32
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-07 10:02:12
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { index } = controller.ai;
  router.get("/config", index.getConfig);

  router.post("/generate", verify, index.generate);
  router.get("/task/progress", verify, index.progress);
  router.put("/task", index.update);
  router.get("/task/list", verify, index.list);
  router.get("/task/detail", verify, index.detail);
  // 轮询所有任务，项目启动时执行一次
  router.get("/task/poller", index.pollAllTask);
  router.get("/task/test", index.test);
  useChildRouter(router);
};
