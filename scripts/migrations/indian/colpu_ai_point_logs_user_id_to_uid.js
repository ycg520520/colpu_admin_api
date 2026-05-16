/**
 * point_logs：历史库若仍为 user_id 列则改为 uid（与 users.uid 一致）
 */
import { DataTypes } from "sequelize";

export default {
  name: "colpu_ai_point_logs_user_id_to_uid",
  async up({ context }) {
    const qi = context;
    const desc = await qi.describeTable("point_logs").catch(() => null);
    if (!desc) return;
    if (desc.uid) return;
    if (!desc.user_id) return;
    await qi.renameColumn("point_logs", "user_id", "uid", {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "users.uid",
    });
    try {
      await qi.removeIndex("point_logs", "idx_point_logs_user_id");
    } catch {
      // 索引名可能不存在
    }
    await qi.addIndex("point_logs", ["uid"], { name: "idx_point_logs_uid" });
  },

  async down({ context }) {
    const qi = context;
    const desc = await qi.describeTable("point_logs").catch(() => null);
    if (!desc?.uid || desc.user_id) return;
    try {
      await qi.removeIndex("point_logs", "idx_point_logs_uid");
    } catch {
      //
    }
    await qi.renameColumn("point_logs", "uid", "user_id", {
      type: DataTypes.STRING(32),
      allowNull: false,
    });
    await qi.addIndex("point_logs", ["user_id"], { name: "idx_point_logs_user_id" });
  },
};
