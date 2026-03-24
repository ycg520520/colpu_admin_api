/**
 * @Author: colpu
 * @Date: 2026-02-13 22:13:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 22:02:07
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

import { DataTypes } from "sequelize";
export default (sequelize) => {
  const UserThirdAuth = sequelize.define('UserThirdAuth', {
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "用户ID",
      validate: {
        notNull: {
          msg: "用户ID不能为空",
        },
        len: [32, 32]
      },
    },
    openid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: '用户openid',
    },
  },
    {
      tableName: "user_third_auth",
      comment: "用户第三方权限关联表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "unique_user_openid",
          unique: true,
          fields: ["user_id", "openid"],
        },
        {
          name: "idx_user_id",
          fields: ["user_id"],
        },
        {
          name: "idx_openid",
          fields: ["openid"],
        },]
    }
  );
  return UserThirdAuth;
}

