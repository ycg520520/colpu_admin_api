/**
 * @Author: colpu
 * @Date: 2025-11-26 00:02:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 23:18:37
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const RolePermissions = sequelize.define('RolePermissions', {
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "角色ID",
      validate: {
        notNull: {
          msg: "角色ID不能为空",
        },
        min: 1,
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
      tableName: "role_premission",
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
          name: "unique_role_perm",
          unique: true,
          fields: ["role_id", "perm_id"],
        },
        {
          name: "idx_role_id",
          fields: ["role_id"],
        },
        {
          name: "idx_perm_id",
          fields: ["perm_id"],
        },
      ],
    }
  );
  return RolePermissions;
}
