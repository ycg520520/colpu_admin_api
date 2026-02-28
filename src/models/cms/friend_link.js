/**
 * @Author: colpu
 * @Date: 2025-12-15 15:24:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 15:26:26
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const FriendLinks = sequelize.define('FriendLinks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '链接名称'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '链接地址'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
  }, {
    tableName: 'friend_links',
    comment: '友情链接表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
    }
  });
  return FriendLinks;
}
