/**
 * @Author: colpu
 * @Date: 2026-03-27 08:44:18
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-09 10:31:17
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
import moment from "moment";
export default (sequelize) => {
  const Records = sequelize.define('Records', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '用户ID'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "当前调用方法或模型",
    },
    task_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "当前类型",
    },
    task_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "任务输出结果",
    },
    original_images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "原始输入图片",
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "处理后的图片",
    },
    task_status: {
      type: DataTypes.ENUM("PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED", "UNKNOWN"),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: "状态，PENDING：任务排队中，RUNNING：任务处理中，SUCCEEDED：任务执行成功，FAILED：任务执行失败，CANCELED：任务已取消，UNKNOWN：任务不存在或状态未知",
    },
    input: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "输入参数",
    },
    output: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "完成输出结果",
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "参数",
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "状态，1-正常，0-过期",
    },
    request_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "请求ID",
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "过期时间",
    },
  }, {
    tableName: 'records',
    comment: '修复记录',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      beforeCreate: async (record) => {
        record.expired_at = moment().add(1, 'month');
      },
    }
  });
  return Records;

}
