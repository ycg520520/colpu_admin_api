/**
 * @Author: colpu
 * @Date: 2026-01-14 16:45:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-08 22:43:57
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Spider = sequelize.define('Spider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    classify_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '采集标题'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '采集地址'
    },
    start_page: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 0,
      comment: '开始页码'
    },
    end_page: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 0,
      comment: '结束页码'
    },
    rule: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '定时任务规则'
    },
    parse_data: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '格式化数据函数'
    },
    charset: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '编码0:utf-8，1:gb2312'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "状态，0关闭定时采集，1开启定时采集",
    },
  }, {
    tableName: 'spider',
    comment: '页面采集表',
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
  return Spider;
}
