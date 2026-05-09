/**
 * colpu_ai 库：单文件建全量表（与 src/models/ai 下模型一致；表结构仅以迁移为准，不使用 sequelize.sync）
 */
import { DataTypes } from "sequelize";

const TS = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
};

export default {
  name: "colpu_ai_schema",
  async up({ context }) {
    await context.createTable("classify", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
      icon: { type: DataTypes.STRING(100), allowNull: true },
      banner: { type: DataTypes.STRING(255), allowNull: true },
      path: { type: DataTypes.STRING(255), allowNull: true },
      count: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      model: { type: DataTypes.STRING(100), allowNull: true },
      upload_opt: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [{ tip: "上传您的照片" }],
      },
      prompt: { type: DataTypes.TEXT, allowNull: true },
      prompt_variables: { type: DataTypes.JSON, allowNull: true },
      aspect_ratio: { type: DataTypes.STRING(20), allowNull: true, defaultValue: "3:4" },
      enable_crop: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
      enable_face_detect: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
      enable_grid_split: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
      enable_enhance: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
      cost_point: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
      cost_point_hd: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
      size: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "1K" },
      size_hd: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "2K" },
      output_width: { type: DataTypes.INTEGER, allowNull: true },
      output_height: { type: DataTypes.INTEGER, allowNull: true },
      output_dpi: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 72 },
      is_hot: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
      sort_order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      remark: { type: DataTypes.STRING(500), allowNull: true },
      status: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
      created_at: TS,
      updated_at: TS,
    });

    await context.createTable("template", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: true },
      img_src: { type: DataTypes.STRING(255), allowNull: true },
      img_width: { type: DataTypes.INTEGER, allowNull: true },
      img_height: { type: DataTypes.INTEGER, allowNull: true },
      line_art_src: { type: DataTypes.STRING(255), allowNull: true },
      prompt: { type: DataTypes.TEXT, allowNull: true },
      prompt_variables: { type: DataTypes.JSON, allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      remark: { type: DataTypes.STRING(500), allowNull: true },
      status: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
      created_at: TS,
      updated_at: TS,
    });

    await context.createTable("classify_template", {
      classify_id: { type: DataTypes.BIGINT, allowNull: false },
      template_id: { type: DataTypes.BIGINT, allowNull: false },
      created_at: TS,
    });
    await context.addIndex("classify_template", ["classify_id", "template_id"], {
      name: "unique_classify_template",
      unique: true,
    });
    await context.addIndex("classify_template", ["classify_id"], { name: "idx_classify_id" });
    await context.addIndex("classify_template", ["template_id"], { name: "idx_template_id" });

    await context.createTable("classify_extend", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      classify_id: { type: DataTypes.INTEGER, allowNull: false },
      feature: { type: DataTypes.STRING(500), allowNull: true },
      icon: { type: DataTypes.STRING(100), allowNull: true },
      src: { type: DataTypes.STRING(255), allowNull: false },
      original_src: { type: DataTypes.STRING(255), allowNull: false },
      slider_percent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.5 },
      is_scale: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      example_right: { type: DataTypes.JSON, allowNull: true },
      example_error: { type: DataTypes.JSON, allowNull: true },
      status: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
      created_at: TS,
      updated_at: TS,
    });

    await context.createTable("records", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      uid: { type: DataTypes.STRING, allowNull: false },
      classify_id: { type: DataTypes.INTEGER, allowNull: false },
      model: { type: DataTypes.STRING(191), allowNull: false },
      task_id: { type: DataTypes.STRING, allowNull: false },
      task_status: {
        type: DataTypes.ENUM(
          "PENDING",
          "RUNNING",
          "SUCCEEDED",
          "FAILED",
          "CANCELED",
          "UNKNOWN",
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
      original_images: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      status: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
      expired_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      created_at: TS,
      updated_at: TS,
    });

    await context.createTable("record_payloads", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      record_id: { type: DataTypes.INTEGER, allowNull: true },
      task_id: { type: DataTypes.STRING(128), allowNull: false },
      input: { type: DataTypes.JSON, allowNull: true },
      output: { type: DataTypes.JSON, allowNull: true },
      progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING(32), allowNull: true },
      message: { type: DataTypes.STRING(255), allowNull: true },
      is_real_progress: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      created_at: TS,
      updated_at: TS,
    });
    await context.addIndex("record_payloads", ["record_id"], { name: "idx_record_id" });
    await context.addIndex("record_payloads", ["task_id"], { unique: true, name: "uniq_task_id" });
  },

  async down({ context }) {
    await context.dropTable("record_payloads");
    await context.dropTable("records");
    await context.dropTable("classify_extend");
    await context.dropTable("classify_template");
    await context.dropTable("template");
    await context.dropTable("classify");
  },
};
