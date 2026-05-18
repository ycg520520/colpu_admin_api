/**
 * @Author: colpu
 * @Date: 2026-05-14
 * 若无附赠列：`ALTER TABLE recharge_orders ADD COLUMN give_point INT NOT NULL DEFAULT 0 COMMENT '支付成功后附赠积分（下单快照）' AFTER point;`
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RechargeOrder = sequelize.define(
    "RechargeOrder",
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
        comment: "用户 uid，对应 users.uid",
      },
      out_trade_no: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        comment: "商户订单号；值写入 signData.outTradeNo，推送 OutTradeNo 同值",
      },
      product_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "虚拟支付道具 ID（signData.productId），即 recharge_packages.id",
      },
      sale_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "实付金额（分），下单时取套餐 sale_price，与米大师 goodsPrice 一致",
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "支付成功后发放的基础积分（下单时快照套餐 point）",
      },
      give_point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "支付成功后附赠积分（下单时快照套餐 give_point）",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
        comment: "订单状态：pending 待支付 | success 已支付并已发货 | closed 已关闭",
      },
      transaction_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "微信侧支付单号，回调 payload 的 TransactionId / WxOrderId，成功时写入",
      },
      prepay_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "预支付 ID（仅传统 JSAPI 统一下单使用）；当前虚拟支付无此字段，保留占位，默认 null",
      },
      description: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "商品描述，下单时取套餐 description 或 name，用于展示与对账",
      },
      invite_campaign_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: "非空表示使用邀请码参团，对应 invite_campaigns.id",
      },
    },
    {
      tableName: "recharge_orders",
      comment: "积分充值订单（小程序虚拟支付 / 米大师）",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_recharge_orders_uid", fields: ["uid"] },
        { name: "idx_recharge_orders_status", fields: ["status"] },
        { name: "idx_recharge_orders_invite_campaign_id", fields: ["invite_campaign_id"] },
      ],
    },
  );
  return RechargeOrder;
};
