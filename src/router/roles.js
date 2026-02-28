/**
 * @Author: colpu
 * @Date: 2025-11-16 19:59:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 16:51:51
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const roles = controller.roles;
  router.get("/role/list", verify, roles.roleList);
  router.get("/role/select", verify, roles.roleSelect);

  router.get('/role', verify, roles.getRole);
  router.post('/role', verify, roles.createRole);
  router.put('/role', verify, roles.updateRole);
  router.delete('/role', verify, roles.deleteRole);

  router.get('/role/user', verify, roles.getRoleUser);
  router.post('/role/user', verify, roles.createRoleUser);
  router.delete('/role/user', verify, roles.deleteRoleUser);

  router.post('/role/permission', verify, roles.rolePermission);
};
