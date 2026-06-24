/**
 * @Author: colpu
 * @Date: 2026-03-27 08:44:18
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-24 16:21:33
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
import moment from "moment";
export default (sequelize) => {
  const Records = sequelize.define("Records", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "主键ID"
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "用户ID"
    },
    classify_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "classify 表主键，与生成请求 body.id 一致",
    },
    model: {
      type: DataTypes.STRING(191),
      allowNull: false,
      comment: "分类路由键，对应 classify.model；实现细节见 record_payloads.input 中的 provider_model",
    },
    task_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "任务输出结果",
    },
    task_status: {
      type: DataTypes.ENUM("PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED", "UNKNOWN"),
      // PENDING：任务排队中，RUNNING：任务处理中，SUCCEEDED：任务执行成功，FAILED：任务执行失败，CANCELED：任务取消，UNKNOWN 任务不存在或状态未知
      allowNull: false,
      defaultValue: "PENDING",
      comment: "任务状态枚举；前端进度条等见 record_payloads.status（字符串阶段）",
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
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "状态，1-正常，0-过期",
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "过期时间",
    },
  }, {
    tableName: "records",
    comment: "修复记录",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      beforeCreate: async (record) => {
        record.expired_at = moment().add(1, "month");
      },
    }
  });
  return Records;

}
