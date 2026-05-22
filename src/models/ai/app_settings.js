/**
 * AI 小程序全局配置（键值）
 */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AppSetting = sequelize.define(
    "AppSetting",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "主键",
      },
      setting_key: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        comment: "配置键，如 splash_countdown、default_point",
      },
      setting_value: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "配置值（JSON 标量或对象）",
      },
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "说明",
      },
    },
    {
      tableName: "app_settings",
      comment: "AI 小程序全局配置",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    },
  );
  return AppSetting;
};
