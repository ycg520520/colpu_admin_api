/**
 * @Author: colpu
 * @Date: 2026-02-13 22:13:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-13 22:22:39
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

import { DataTypes } from "sequelize";
export default (sequelize) => {
  const UserAuth = sequelize.define('UserAuth', {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: "用户认证ID",
    },
    uid: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "用户uid唯一值",
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "用户三方登录类型，\n1：微信登录，\n2：QQ登录",
    },
    openid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: '用户openid', // 微信openid或QQ openid
    },
    unionid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'QQ使用的平台唯一id',
    },
    isbind: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "是否绑定用户，0：未绑定，1：已绑定",
    },
  },
    {
      tableName: "user_auths",
      comment: "用户认证表",
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [{
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: ['id', 'openid']  // 复合主键
      },
      {
        name: 'openid_UNIQUE',
        unique: true,
        using: 'BTREE',
        fields: ['openid']
      },
      {
        name: 'id_UNIQUE',
        unique: true,
        using: 'BTREE',
        fields: ['id']
      },
      {
        name: 'unionid_UNIQUE',
        unique: true,
        using: 'BTREE',
        fields: ['unionid']
      },
      {
        name: 'uid_UNIQUE',
        unique: true,
        using: 'BTREE',
        fields: ['uid']
      }],
      hooks: {
      },
    }
  );
  return UserAuth;
}

