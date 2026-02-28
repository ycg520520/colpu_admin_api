/**
 * @Author: colpu
 * @Date: 2025-09-25 17:33:45
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-09-26 08:20:53
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

export const ENUM_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
};

export const ENUM_STATUS_LABELS = {
  [ENUM_STATUS.DISABLED]: "禁用",
  [ENUM_STATUS.ENABLED]: "启用",
};

export const ENUM_STATUS_MAP = {
  disabled: ENUM_STATUS.DISABLED,
  enabled: ENUM_STATUS.ENABLED,
  false: ENUM_STATUS.DISABLED,
  true: ENUM_STATUS.ENABLED,
  0: ENUM_STATUS.DISABLED,
  1: ENUM_STATUS.ENABLED,
};

export const RESOURCE_TYPES = {
  MENU: "menu",
  BUTTON: "button",
  API: "api",
  DATA: "data",
};

export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPES.MENU]: "菜单",
  [RESOURCE_TYPES.BUTTON]: "按钮",
  [RESOURCE_TYPES.API]: "接口",
  [RESOURCE_TYPES.DATA]: "数据",
};

export const DEFAULT_PERMISSIONS = {
  // 系统管理
  SYSTEM_MANAGE: "system:manage",
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  PERMISSION_MANAGE: "permission:manage",

  // 菜单权限
  DASHBOARD_VIEW: "dashboard:view",
  USER_LIST_VIEW: "user:list:view",
  USER_CREATE: "user:create",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",
};
