/**
 * @Author: colpu
 * @Date: 2026-06-25 08:58:47
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-25 15:30:58
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";

const TS = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
};
const table = "classify_extend";
export default {
  name: table,

  async up({ context: queryInterface }) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) =>
      typeof t === "string" ? t : t.tableName || t.name || t,
    );
    if (!names.includes(table)) {
      console.warn(`[${this.name}] 跳过：表 ${table} 不存在`);
      return;
    }
    const desc = await queryInterface.describeTable(table);
    if (desc.href) {
      console.log(`[${this.name}] 跳过：列 href 已存在`);
      return;
    }
    const hrefColumn = {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类链接'
    };
    if (desc.src) {
      hrefColumn.before = "src";
    }
    // 添加字段
    await queryInterface.addColumn(table, "href", hrefColumn);
    console.log(`[${this.name}] 已添加 classify_extend.href`);
    const isAutoColumn = {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否自动播放'
    };
    if (desc.slider_percent) {
      isAutoColumn.after = "slider_percent";
    }
    // 添加字段
    await queryInterface.addColumn(table, "is_auto", isAutoColumn);
    console.log(`[${this.name}] 已添加 classify_extend.is_auto`);
  },

  async down({ context: queryInterface }) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) =>
      typeof t === "string" ? t : t.tableName || t.name || t,
    );
    if (!names.includes(table)) return;

    const desc = await queryInterface.describeTable(table);
    if (!desc.href) return;
    // 删除字段
    await queryInterface.removeColumn(table, "href");
  },
};
