/**
 * @Author: colpu
 * @Date: 2025-12-10 23:18:52
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-23 15:04:19
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const ClassifyTemplate = sequelize.define('ClassifyTemplate', {
    classify_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "分类ID",
      validate: {
        notNull: {
          msg: "分类ID不能为空",
        },
        min: 1,
      },
    },
    template_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "模板ID",
      validate: {
        notNull: {
          msg: "模板ID不能为空",
        },
        min: 1,
      },
    }
  },
    {
      tableName: "classify_template",
      comment: "分类模板关联表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "unique_classify_template",
          unique: true,
          fields: ["classify_id", "template_id"],
        },
        {
          name: "idx_classify_id",
          fields: ["classify_id"],
        },
        {
          name: "idx_template_id",
          fields: ["template_id"],
        },
      ],
    }
  );
  return ClassifyTemplate;
}
