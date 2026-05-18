/**
 * 邀请购同款：被邀请人支付成功记录（每人每活动仅计一次）
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const InviteJoin = sequelize.define(
    "InviteJoin",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      campaign_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      invitee_uid: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      invitee_order_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "invite_joins",
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "uniq_invite_joins_campaign_uid",
          unique: true,
          fields: ["campaign_id", "invitee_uid"],
        },
        { name: "idx_invite_joins_campaign", fields: ["campaign_id"] },
      ],
    },
  );
  return InviteJoin;
};
