/**
 * @Author: colpu
 * @Date: 2025-09-25 16:41:10
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-02 00:17:37
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

// -- 部门表（用于组织架构）
// CREATE TABLE Departments (
//   id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
//   parent_id BIGINT DEFAULT 0 COMMENT '父级部门ID',
//   code VARCHAR(50) UNIQUE NOT NULL COMMENT '部门编码',
//   name VARCHAR(100) NOT NULL COMMENT '部门名称',
//   leader_id BIGINT COMMENT '部门负责人ID',
//   sort_order INT DEFAULT 0 COMMENT '排序',
//   status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
//   created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//   updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//   INDEX idx_code (code),
//   INDEX idx_parent_id (parent_id),
//   FOREIGN KEY(leader_id) REFERENCES user(id)
// ) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='部门表';
import { DataTypes } from "sequelize";
import statusFn from "../../constants/status.js";
export default (sequelize) => {
  const Departments = sequelize.define('Departments', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: "部门ID",
    },
    parent_id: {
      type: DataTypes.BIGINT,
      comment: "父级部门ID",
      allowNull: true,
      // references: {
      //   model: "Departments",
      //   key: "id",
      // },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "部门编码",
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "部门名称",
      validate: {
        notEmpty: true,
      },
    },
    leader_id: {
      type: DataTypes.BIGINT,
      comment: "部门负责人ID",
      // references: {
      //   model: "users",
      //   key: "id",
      // },
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "排序",
    },
    status: statusFn(),
  },
    {
      tableName: "departments",
      comment: "部门表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_code", fields: ["code"] },
        { name: "idx_parent_id", fields: ["parent_id"] },
      ],
    }
  )
  return Departments;
}
