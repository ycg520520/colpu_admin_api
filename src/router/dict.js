/**
 * @Author: colpu
 * @Date: 2025-11-03 14:44:07
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-10 08:59:15
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: '/dict' });
  const dict = controller.dict;
  router.get('/all', dict.getAllDictData);
  router.get('/', dict.getDict);

  router.get('/types', verify, dict.getDictTypes);
  router.post('/types', verify, dict.createDictType);
  router.put('/types', verify, dict.updateDictType);
  router.delete('/types', verify, dict.deleteDictType);

  router.get('/data', verify, dict.getDictData);
  router.post('/data', verify, dict.createDictData);
  router.put('/data', verify, dict.updateDictData);
  router.delete('/data', verify, dict.deleteDictData);

  router.get('/types/check', verify, dict.checkDictType);
  router.get('/data/check', verify, dict.checkDictData);

  useChildRouter(router);
};
