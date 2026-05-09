/**
 * @Author: colpu
 * @Date: 2026-05-01 11:06:00
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-09 20:26:09
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const RecordPayloads = sequelize.define('RecordPayloads', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "关联 records.id",
    },
    task_id: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "任务ID",
    },
    input: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "输入参数",
    },
    output: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "输出摘要（含 task_status 及上游返回体，诊断用）",
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "任务进度 0-100",
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "与 task_status 同文：PENDING/RUNNING/SUCCEEDED/FAILED；无 CANCELED/UNKNOWN（归并为 FAILED/PENDING）",
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "进度提示文案",
    },
    is_real_progress: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否真实进度（如 ComfyUI）",
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "payload 结构版本",
    },
  }, {
    tableName: 'record_payloads',
    comment: '任务输入输出扩展表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        name: "idx_record_id",
        fields: ["record_id"],
      },
      {
        name: "uniq_task_id",
        unique: true,
        fields: ["task_id"],
      },
    ],
  });
  return RecordPayloads;
}
