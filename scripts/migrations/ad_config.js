/**
 * colpu_ai：广告位 ad_slots、全局配置 app_settings
 */
import { DataTypes } from "sequelize";

const TS = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
};

export default {
  name: "ad_config",

  async up({ context: queryInterface }) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) =>
      typeof t === "string" ? t : t.tableName || t.name || t,
    );

    if (!names.includes("ad_slots")) {
      await queryInterface.createTable("ad_slots", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
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
        },
        status: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 1,
        },
        enabled: { type: DataTypes.TINYINT(1), allowNull: true },
        unit_id: {
          type: DataTypes.STRING(64),
          allowNull: false,
          defaultValue: "",
        },
        ad_intervals: { type: DataTypes.INTEGER, allowNull: true },
        src: { type: DataTypes.STRING(255), allowNull: true },
        href: { type: DataTypes.STRING(512), allowNull: true },
        title: { type: DataTypes.STRING(128), allowNull: true },
        disabled: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
        },
        created_at: TS,
        updated_at: TS,
      });
      await queryInterface.addIndex("ad_slots", ["slot_type", "status"], {
        name: "idx_ad_slots_type_status",
      });
      await queryInterface.addIndex("ad_slots", ["slot_type", "sort_order"], {
        name: "idx_ad_slots_sort",
      });
      console.log(`[${this.name}] 已创建 ad_slots`);
    } else {
      console.log(`[${this.name}] 跳过：ad_slots 已存在`);
    }

    if (!names.includes("app_settings")) {
      await queryInterface.createTable("app_settings", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        setting_key: {
          type: DataTypes.STRING(64),
          allowNull: false,
          unique: true,
        },
        setting_value: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        remark: { type: DataTypes.STRING(255), allowNull: true },
        created_at: TS,
        updated_at: TS,
      });
      console.log(`[${this.name}] 已创建 app_settings`);
    } else {
      console.log(`[${this.name}] 跳过：app_settings 已存在`);
    }
  },

  async down({ context: queryInterface }) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) =>
      typeof t === "string" ? t : t.tableName || t.name || t,
    );
    if (names.includes("ad_slots")) await queryInterface.dropTable("ad_slots");
    if (names.includes("app_settings")) {
      await queryInterface.dropTable("app_settings");
    }
  },
};
