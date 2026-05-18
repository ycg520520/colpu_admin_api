/**
 * @Author: colpu
 * @Date: 2026-05-15 22:03:28
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-16 16:05:08
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * 微信虚拟支付充值套餐（数据表 recharge_packages）
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RechargePackage = sequelize.define(
    "RechargePackage",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "套餐 ID，和微信虚拟支付道具 ID 对应，signData.productId 同值",
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "套餐名称",
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "商品描述，可空；空则下单时用 name",
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "支付成功后发放积分",
      },
      give_point: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "支付成功后附赠积分",
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "标价（分），仅展示",
      },
      sale_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "实付/活动价（分）",
      },
      enhance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "附赠张数等业务扩展",
      },
      buy_quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
        comment: "short_series_coin 时代币购买数量",
      },
      invite_refund_invitees: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "0 关闭；>0 邀请 N 人购买同款并支付成功后，团长虚拟支付原路退款",
      },
      tip_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "0 普通文案；1 返现包文案，提示邀请好友助力返现",
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "列表排序，升序",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1 上架 0 下架",
      },
    },
    {
      tableName: "recharge_packages",
      comment: "虚拟支付充值套餐",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_recharge_packages_status_sort", fields: ["status", "sort_order"] },
      ],
    },
  );
  return RechargePackage;
};
