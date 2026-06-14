/**
 * @Author: colpu
 * @Date: 2025-12-15 21:15:32
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-05 14:32:28
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/ai' });
  const { index } = controller.ai;
  router.get("/config", index.getConfig);
  // 兼容第一个版本的接口
  router.post(["/image/repair", "/image/generateSuper", "/image/makeSuper", "/image/colorize"], verify, (ctx, next) => {
    const actionMap = {
      "repair": { id: 7, action: "wan2.6-image" },
      "generateSuper": { id: 16, action: "generateSuperResolutionImage" },
      "makeSuper": { id: 17, action: "makeSuperResolutionImage" },
      "colorize": { id: 18, action: "colorizeImage" },
    }
    const res = actionMap[ctx.path.split("/").slice(-1)[0]];
    if (!res) {
      throw new Error('不支持的接口');
    }
    const body = ctx.request.body;
    if (["makeSuperResolutionImage", 'colorizeImage'].includes(res.action)) {
      body.images = [body.imageUrl];
      delete body.imageUrl;
    }
    if (res.action === "makeSuperResolutionImage") {
      body.images = [body.url];
      delete body.url;
    }
    ctx.request.body.model = res.action;
    ctx.request.body.id = res.id;
    ctx.request.body.point = 10;
    return next();
  }, index.generate);
  router.post("/generate", verify, index.generate);
  router.get("/task/progress", verify, index.progress);
  router.put("/task", index.update);
  router.get("/task/list", verify, index.list);
  router.get("/task/detail", verify, index.detail);
  // 轮询所有任务，项目启动时执行一次
  router.get("/task/poller", index.pollAllTask);
  router.post("/runninghub/webhook", index.webhook);
  router.get("/task/test", index.test);
  useChildRouter(router);
};
