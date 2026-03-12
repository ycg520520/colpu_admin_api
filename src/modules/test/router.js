/**
 * @Author: colpu
 * @Date: 2025-12-15 21:15:32
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-08 23:24:11
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default (app) => {
  const { controller, router } = app;
  router.get("/modules/test", controller.test.index.index);
};
