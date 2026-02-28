/**
 * @Author: colpu
 * @Date: 2025-11-30 14:39:50
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-04 17:30:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
// 数据权限范围表 - 控制用户能看到什么数据
export default (sequelize) => {
  const RolePermissionScope = sequelize.define('RolePermissionScope', {
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "角色ID",
      primaryKey: true,
      validate: {
        notNull: {
          msg: "角色ID不能为空",
        },
        min: 1,
      },
    },
    scope_type: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      field: 'scope_type',
      comment: '权限作用范围：all:0-全部数据权限,dept_blow:1-本部门及以下数据权限,dept:2-仅本部门数据权限,self:3-仅本人数据权限,custom:4-自定义数据权限'
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: `
        {
          "departments": [department_id1, department_id2], // 部门id，scope_type为COMPANY或DEPARTMENT或CUSTOM时有效
          "users": [userid1, userid2], // 用户id USER时有效
        }
      `,
    },
  },
    {
      tableName: "role_permission_scope",
      comment: "角色数据权限范围表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "unique_role_permission_scope",
          unique: true,
          fields: ["role_id"],
        },
        {
          name: "idx_role_id",
          fields: ["role_id"],
        },
      ],
    }
  );
  return RolePermissionScope;
}
