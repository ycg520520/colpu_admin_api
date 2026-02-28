/**
 * @Author: colpu
 * @Date: 2025-09-26 08:52:24
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-26 11:44:32
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
import { ENUM_STATUS, ENUM_STATUS_MAP } from "./enum.js";
export default (msg) => ({
  type: DataTypes.TINYINT(1),
  allowNull: false,
  defaultValue: ENUM_STATUS.ENABLED,
  comment: `状态：${ENUM_STATUS.DISABLED}-禁用，${ENUM_STATUS.ENABLED}-启用`,
  validate: {
    isIn: {
      args: [Object.values(ENUM_STATUS)],
      msg,
    }
  },
  set(value) {
    if (ENUM_STATUS_MAP[value] !== undefined) {
      this.setDataValue("status", ENUM_STATUS_MAP[value]);
    } else {
      this.setDataValue("status", Number(value) || DEPARTMENT_STATUS.ENABLED);
    }
  },
});
