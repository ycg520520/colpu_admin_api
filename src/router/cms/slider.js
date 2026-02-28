/**
 * @Author: colpu
 * @Date: 2026-01-14 16:52:18
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 21:51:06
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import verify from "../../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const slider = controller.cms.slider;
  router.get("/slider/list", verify, slider.list);
  router.get('/slider', verify, slider.findOne);
  router.post('/slider', verify, slider.create);
  router.put('/slider', verify, slider.update);
  router.delete('/slider', verify, slider.delete);
};
