/**
 * @Author: colpu
 * @Date: 2025-09-28 13:20:18
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 10:17:38
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
// --客服端表;
// CREATE TABLE `clients`(
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
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "客服端唯一值",
    },
    secret_key: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: "加密后的客户端密钥",
    },
    redirect_uris: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "重定向地址，用户检测客户端重定向地址是否在此字段配置中，往往这个字段为数组",
    },
    scope: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "客户端权限数组，最终颁发的访问令牌（access_token）会包含授权的scope，资源服务器根据令牌中的scope决定是否允许请求。",
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "客服端其他配置",
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "用户状态，1-启用，0-禁用",
    },
  },
    {
      tableName: "clients",
      comment: "OAuth2客服端表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_client_id", unique: true, fields: ["client_id"] },
      ],
    }
  );
  return Clients;
}
