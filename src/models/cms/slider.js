/**
 * @Author: colpu
 * @Date: 2025-12-16 22:58:08
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 16:45:11
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Slider = sequelize.define('Slider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '标题'
    },
    subtitle: {
      type: DataTypes.STRING(125),
      allowNull: true,
      comment: '副标题'
    },
    src: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图片地址'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '连接地址'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '内容'
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
      comment: "分类状态，0不发布，1发布",
    },
  }, {
    tableName: 'slider',
    comment: '轮播图表',
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
  return Slider;
}
