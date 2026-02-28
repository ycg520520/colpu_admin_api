/**
 * @Author: colpu
 * @Date: 2025-09-28 13:20:18
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-17 23:07:56
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
// --客服端表;
// CREATE TABLE `client`(
//   `id` int NOT NULL AUTO_INCREMENT COMMENT '自增id',
//   `client_id` varchar(16) NOT NULL COMMENT '客服端唯一值',
//   `secret_key` varchar(32) NULL DEFAULT NULL COMMENT '客服端加密',
//   `redirect_uris` json NULL COMMENT '重定向地址',
//   `scope` json NULL COMMENT '客户端权限',
//   `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态，0表示禁用，1表示启用',
//   `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//   `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
//   PRIMARY KEY (`id`) USING BTREE
// ) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci  COMMENT='用户表';
export default (sequelize) => {
  const Clients = sequelize.define('Clients', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: "自增id",
    },
    client_id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: "idx_client_id",
      comment: "客服端唯一值",
    },
    secret_key: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "客服端加密",
    },
    redirect_uris: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "重定向地址",
    },
    scope: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "客户端权限",
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "用户状态，1表示禁用，0表示启用",
    },
    // create_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: DataTypes.NOW,
    //   comment: "创建时间",
    // },
    // update_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: DataTypes.NOW,
    //   comment: "更新时间",
    // },
  },
    {
      tableName: "clients",
      comment: "客服端表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "idx_client_id",
          unique: true,
          fields: ["client_id"],
        },
      ],
      hooks: {
        beforeUpdate: (user) => {
          user.update_time = new Date();
        },
      },
    }
  );
  return Clients;
}
