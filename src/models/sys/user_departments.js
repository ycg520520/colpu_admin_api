/**
 * @Author: colpu
 * @Date: 2025-09-25 16:41:24
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-07 15:40:23
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

import { DataTypes } from "sequelize";
export default (sequelize) => {
  const UserDepartments = sequelize.define('UserDepartments', {
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "用户ID",
      validate: {
        notNull: {
          msg: "用户ID不能为空",
        },
        min: 1,
      },
    },
    dept_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "部门ID",
      validate: {
        notNull: {
          msg: "部门ID不能为空",
        },
        min: 1,
      },
    },
  },
    {
      tableName: "user_departments",
      comment: "部门用户关系表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "uk_user_dept",
          unique: true,
          fields: ["user_id", "dept_id"],
        },
        {
          name: "idx_user_id",
          fields: ["user_id"],
        },
        {
          name: "idx_dept_id",
          fields: ["dept_id"],
        },
      ],
    }
  );
  return UserDepartments;
}
