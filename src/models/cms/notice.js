/**
 * @Author: colpu
 * @Date: 2026-01-07 15:36:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 22:45:28
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * @Author: colpu
 * @Date: 2025-12-15 11:54:22
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-07 15:19:42
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
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '通知标题'
    },
    type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '1通知 2公告',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '文章内容'
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
    tableName: 'notice',
    comment: '通知公告表',
    timestamps: true,
    underscored: true,
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
    }
  });
  return Notice;
}
