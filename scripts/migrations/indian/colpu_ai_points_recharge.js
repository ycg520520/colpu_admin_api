/**
 * colpu_ai：积分流水、充值订单、充值套餐（与 src/models/ai 下 point_logs / recharge_orders / recharge_packages 一致）
 */
import { DataTypes } from "sequelize";

const TS = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
};

export default {
  name: "colpu_ai_points_recharge",
  async up({ context }) {
    await context.createTable("recharge_packages", {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: DataTypes.STRING(64), allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: true },
      point: { type: DataTypes.INTEGER, allowNull: false },
      price: { type: DataTypes.INTEGER, allowNull: false },
      sale_price: { type: DataTypes.INTEGER, allowNull: false },
      enhance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      buy_quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
      created_at: TS,
      updated_at: TS,
    });
    await context.addIndex("recharge_packages", ["status", "sort_order"], {
      name: "idx_recharge_packages_status_sort",
    });

    await context.createTable("recharge_orders", {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      uid: { type: DataTypes.STRING(32), allowNull: false },
      out_trade_no: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      product_id: { type: DataTypes.STRING(64), allowNull: false },
      sale_price: { type: DataTypes.INTEGER, allowNull: false },
      point: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "pending" },
      transaction_id: { type: DataTypes.STRING(64), allowNull: true },
      prepay_id: { type: DataTypes.STRING(128), allowNull: true },
      description: { type: DataTypes.STRING(128), allowNull: true },
      created_at: TS,
      updated_at: TS,
    });
    await context.addIndex("recharge_orders", ["uid"], { name: "idx_recharge_orders_uid" });
    await context.addIndex("recharge_orders", ["status"], { name: "idx_recharge_orders_status" });

    await context.createTable("point_logs", {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      uid: { type: DataTypes.STRING(32), allowNull: false },
      delta: { type: DataTypes.INTEGER, allowNull: false },
      balance_after: { type: DataTypes.INTEGER, allowNull: false },
      biz_type: { type: DataTypes.STRING(32), allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: true },
      ref_type: { type: DataTypes.STRING(64), allowNull: true },
      ref_id: { type: DataTypes.STRING(128), allowNull: true },
      meta: { type: DataTypes.JSON, allowNull: true },
      created_at: TS,
    });
    await context.addIndex("point_logs", ["uid"], { name: "idx_point_logs_uid" });
    await context.addIndex("point_logs", ["created_at"], { name: "idx_point_logs_created_at" });
  },

  async down({ context }) {
    await context.dropTable("point_logs");
    await context.dropTable("recharge_orders");
    await context.dropTable("recharge_packages");
  },
};
