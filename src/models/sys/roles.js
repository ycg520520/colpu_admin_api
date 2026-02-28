/**
 * @Author: colpu
 * @Date: 2025-09-25 09:03:34
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 16:58:32
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
import statusFn from "../../constants/status.js";
export default (sequelize) => {
  const Roles = sequelize.define('Roles', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: "角色ID",
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "角色编码, 唯一标识",
      validate: {
        notEmpty: {
          msg: "角色编码不能为空",
        },
        len: {
          args: [1, 50],
          msg: "角色编码长度必须在1-50个字符之间",
        },
        is: {
          args: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
          msg: "角色编码只能包含字母、数字和下划线，且必须以字母或下划线开头",
        },
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "角色名称",
      validate: {
        notEmpty: {
          msg: "角色名称不能为空",
        },
        len: {
          args: [1, 50],
          msg: "角色名称长度必须在1-50个字符之间",
        },
      },
    },
    remark: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "角色描述",
      validate: {
        len: {
          args: [0, 200],
          msg: "角色描述长度不能超过200个字符",
        },
      },
      set(value) {
        this.setDataValue("remark", value || null);
      },
    },
    sort_order: {
      type: DataTypes.INTEGER,     // 数据类型为整数
      defaultValue: 0,             // 默认值为0
      comment: '排序'              // 字段注释
    },
    status: statusFn(),
    editable: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "编辑状态，0可编辑，1禁止编辑",
    },
  },
    {
      tableName: "roles",
      comment: "角色表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "idx_code",
          fields: ["code"],
          unique: true,
        }
      ],
    }
  );
  return Roles;
}
