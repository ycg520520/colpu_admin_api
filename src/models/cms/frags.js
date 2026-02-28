/**
 * @Author: colpu
 * @Date: 2026-01-14 15:41:36
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-10 16:42:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Frags = sequelize.define('Frags', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '碎片标题'
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '碎片类型'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '碎片内容'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "状态，0下架，1上架",
    },
  }, {
    tableName: 'frags',
    comment: '文章表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  });
  return Frags;
}
