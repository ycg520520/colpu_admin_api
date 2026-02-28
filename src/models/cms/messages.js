/**
 * @Author: colpu
 * @Date: 2025-12-15 15:27:21
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 15:59:54
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Messages = sequelize.define('Messages', {
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
      comment: '留言分类 1->咨询 2->建议 3->投诉 0->其它'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '姓名'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '电话'
    },
    wechat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '微信'
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '邮箱'
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '公司名称'
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '留言内容'
    },
  }, {
    tableName: 'messages',
    comment: '留言表',
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
  return Messages;
}
