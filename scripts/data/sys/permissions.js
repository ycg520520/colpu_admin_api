/**
 * @Author: colpu
 * @Date: 2025-12-07 12:09:57
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 22:32:42
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default [
  {
    id: 1,
    name: "超级管理员权限",
    perm_code: "*:*:*",
    editable: 1,
  },
  {
    name: "用户列表",
    type: "api",
    perm_code: "api:user:list",
    method: "GET",
    path: "/api/user/list"
  },
  {
    name: "全部菜单权限",
    type: "menu",
    menu_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 28, 47, 48, 49, 50, 51, 19, 20, 29, 30, 31, 32, 21, 22, 52, 53, 54, 43, 44, 45, 46, 55, 23, 26, 27, 33, 34, 24, 35, 36, 37, 41, 25, 38, 39, 40, 42, 56],
  },
  {
    name: "所有公司权限",
    type: "scope",
  },
  {
    name: "公共菜单",
    type: "menu",
    menu_ids: [2, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 9, 5, 1],
    remark: "所有管理人员都可拥有权限",
  },
  {
    name: "编辑人员菜单",
    type: "menu",
    menu_ids: [57, 58],
    remark: "给编辑人员菜单权限"
  },
  {
    name: "普通管理员菜单",
    type: "menu",
    menu_ids: [58, 57, 17, 18, 19, 21, 23, 24, 25, 56, 28, 47, 48, 49, 50, 51, 20, 22, 43, 44, 45, 46, 55, 26, 27, 33, 34, 35, 36, 37, 41, 38, 39, 40, 42, 29, 30, 31, 32, 52, 53, 54],
  }
]
