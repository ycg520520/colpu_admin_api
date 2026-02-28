/**
 * @Author: colpu
 * @Date: 2025-12-15 11:44:06
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-13 16:00:15
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Articles = sequelize.define('Articles', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    classify_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '栏目id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '标题'
    },
    subtitle: {
      type: DataTypes.STRING(125),
      allowNull: true,
      comment: '副标题/短标题'
    },
    author: {
      type: DataTypes.STRING(125),
      allowNull: true,
      comment: '作者'
    },
    source: {
      type: DataTypes.STRING(125),
      allowNull: true,
      comment: '来源'
    },
    thumb: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '缩略图'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '外链'
    },
    keywords: {
      type: DataTypes.STRING(125),
      allowNull: true,
      comment: '关键词'
    },
    description: {
      type: DataTypes.STRING(125),
      allowNull: true,
      comment: '文章简述'
    },
    type: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: '1头条 2推荐 3轮播 4热门',
    },
    template: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '详情页模板'
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '文章摘要'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '文章内容'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    pv: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "浏览量",
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "状态，0下架，1上架",
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true, // 允许为空（草稿状态）
      comment: '发布时间'
    }
  }, {
    tableName: 'articles',
    comment: '文章表',
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
  return Articles;
}
