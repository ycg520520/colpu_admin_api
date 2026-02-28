/**
 * @Author: colpu
 * @Date: 2025-12-15 15:31:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 15:37:16
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Notice = sequelize.define('Notice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '留言标题'
    },
    type: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1,
      comment: '留言分类 1->通知 2->公告 0->其它'
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '留言内容'
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '备注'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "状态，0表示禁用，1表示启用",
    },
  }, {
    tableName: 'notice',
    comment: '通知公告表',
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
  return Notice;
}
