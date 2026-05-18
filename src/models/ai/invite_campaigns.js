/**
 * 邀请购同款：团长支付成功后创建活动，满员后团长虚拟支付原路退款
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const InviteCampaign = sequelize.define(
    "InviteCampaign",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      leader_uid: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      leader_order_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        comment: "团长已支付成功的 recharge_orders.id",
      },
      product_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      invite_code: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      invitees_required: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "open",
        comment: "open | pending_refund | refund_done | refund_failed",
      },
      leader_refund_order_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      wechat_refund_wx_order_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "invite_campaigns",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_invite_campaigns_code", fields: ["invite_code"] },
        { name: "idx_invite_campaigns_status", fields: ["status"] },
      ],
    },
  );
  return InviteCampaign;
};
