/**
 * @Author: colpu
 * @Date: 2026-05-14
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const PointLog = sequelize.define(
    "PointLog",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        comment: "主键",
      },
      uid: {
        type: DataTypes.STRING(32),
        allowNull: false,
        comment: "users.uid",
      },
      delta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "变动值，正为增加，负为扣减",
      },
      balance_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "变动后余额",
      },
      biz_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        comment: "recharge | consume | refund | grant",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "展示标题",
      },
      ref_type: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "关联类型，如 ai_task、recharge_order",
      },
      ref_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "关联主键或业务号",
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "扩展信息",
      },
    },
    {
      tableName: "point_logs",
      comment: "积分流水",
      underscored: true,
      updatedAt: false,
      createdAt: "created_at",
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_point_logs_uid", fields: ["uid"] },
        { name: "idx_point_logs_created_at", fields: ["created_at"] },
      ],
    },
  );
  return PointLog;
};
