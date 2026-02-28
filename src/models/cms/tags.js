/**
 * @Author: colpu
 * @Date: 2025-12-15 11:54:22
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 22:06:30
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Tags = sequelize.define('Tags', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '标签名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "标签标识",
      validate: {
        notEmpty: true,
      },
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '引用次数'
    },
  }, {
    tableName: 'tags',
    comment: '标签表',
    timestamps: true,
    underscored: true,
    createdAt: false,
    updatedAt: false,
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
    }
  });
  return Tags;
}
