/**
 * @Author: colpu
 * @Date: 2026-01-14 21:51:19
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-08 19:53:26
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const schedule = controller.schedule;
  router.get('/schedule', verify, schedule.launch);
};
