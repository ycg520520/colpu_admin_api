/**
 * @Author: colpu
 * @Date: 2026-03-27 12:25:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-09 10:36:06
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default {
  name: "records",
  async up({ context }) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await context.createTable('users', { id: Sequelize.INTEGER });
     */
    // await context.addColumn('records', 'test', {
    //   type: DataTypes.STRING,
    //   allowNull: true, // 先允许为空，避免已有数据报错
    // });
  },

  async down({ context }) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await context.dropTable('users');
     */
    await context.removeColumn('records', 'test');
  }

}
