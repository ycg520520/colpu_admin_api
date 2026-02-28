/**
 * @Author: colpu
 * @Date: 2025-11-29 21:06:40
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 17:04:09
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const UserPermission = sequelize.define('UserPermission', {
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
    perm_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "权限ID",
      validate: {
        notNull: {
          msg: "权限ID不能为空",
        },
        min: 1,
      },
    }
  },
    {
      tableName: "user_premission",
      comment: "角色权限关联表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "unique_user_perm",
          unique: true,
          fields: ["user_id", "perm_id"],
        },
        {
          name: "idx_user_id",
          fields: ["user_id"],
        },
        {
          name: "idx_perm_id",
          fields: ["perm_id"],
        },
      ],
    }
  );
  return UserPermission;
}
