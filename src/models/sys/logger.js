/**
 * @Author: colpu
 * @Date: 2026-01-17 11:17:55
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-19 16:27:26
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Logger = sequelize.define('Logger', {
    uid: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "用户UID",
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "用户账号",
    },
    url: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "请求地址",
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "操作类型：GET/CREATE/UPDATE/DELETE/PUT/OPTIONS",
    },
    details: {
      type: DataTypes.JSON,
      comment: "操作详情（如修改前后的字段）"
    },
    status: {
      type: DataTypes.BIGINT,
      defaultValue: 200,
      comment: '状态码'
    },
    ip: {
      type: DataTypes.STRING(45),
      comment: "客户端IP"
    },
    user_agent: {
      type: DataTypes.TEXT,
      comment: "浏览器信息"
    }
  }, {
    tableName: 'logger',
    comment: '日志记录',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
    }
  });
  return Logger;
}
