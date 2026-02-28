/**
 * @Author: colpu
 * @Date: 2025-10-11 22:23:46
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-18 16:35:23
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const { users } = controller;
  router.get("/user/info", verify, users.getUserInfo);
  router.get("/user/list", verify, users.getUserList);
  router.get("/user/search", verify, users.searchUserList);
  router.get("/user/check", users.checkUser);
  router.post("/user", verify, users.createUser);
  router.put("/user", verify, users.updateUser);
  router.del("/user", verify, users.deleteUser);
};
