/**
 * colpu_ai.recharge_orders 增加 meta（运营退款审计）
 */
import { DataTypes } from "sequelize";

export default {
  name: "recharge_orders_meta",

  async up({ context: queryInterface }) {
    const table = "recharge_orders";
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) =>
      typeof t === "string" ? t : t.tableName || t.name || t,
    );
    if (!names.includes(table)) {
      console.warn(`[${this.name}] 跳过：表 ${table} 不存在`);
      return;
    }

    const desc = await queryInterface.describeTable(table);
    if (desc.meta) {
      console.log(`[${this.name}] 跳过：列 meta 已存在`);
      return;
    }

    const column = {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "扩展信息（运营退款审计等）",
    };
    if (desc.invite_campaign_id) {
      column.after = "invite_campaign_id";
    }

    await queryInterface.addColumn(table, "meta", column);
    console.log(`[${this.name}] 已添加 recharge_orders.meta`);
  },

  async down({ context: queryInterface }) {
    const table = "recharge_orders";
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) =>
      typeof t === "string" ? t : t.tableName || t.name || t,
    );
    if (!names.includes(table)) return;

    const desc = await queryInterface.describeTable(table);
    if (!desc.meta) return;

    await queryInterface.removeColumn(table, "meta");
  },
};
