/**
 * 小程序广告位配置（开屏 / Banner / 自定义 / 列表推荐）
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AdSlot = sequelize.define(
    "AdSlot",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "主键",
      },
      slot_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "splash | banner | custom | list",
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "同类型内排序，越大越靠前",
      },
      status: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: "1 启用 0 软删除",
      },
      enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        comment: "开屏是否启用（仅 splash）",
      },
      unit_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: "",
        comment: "微信流量主广告位 unitId",
      },
      ad_intervals: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "自定义广告刷新间隔（秒）",
      },
      src: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "CDN 相对路径或完整 URL",
      },
      href: {
        type: DataTypes.STRING(512),
        allowNull: true,
        comment: "点击跳转链接或小程序 path",
      },
      title: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "展示标题（banner / list）",
      },
      disabled: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: "列表项是否禁用展示（仅 list）",
      },
    },
    {
      tableName: "ad_slots",
      comment: "小程序广告位",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_ad_slots_type_status", fields: ["slot_type", "status"] },
        { name: "idx_ad_slots_sort", fields: ["slot_type", "sort_order"] },
      ],
    },
  );
  return AdSlot;
};
