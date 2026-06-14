/**
 * @Author: colpu
 * @Date: 2026-05-19 00:25:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-08 12:52:53
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const CategoryTemplate = sequelize.define('CategoryTemplate', {
    category_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
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
      primaryKey: true,
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
      tableName: "category_template",
      id: false,
      comment: "类目模板关联表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "idx_category_id",
          fields: ["category_id"],
        },
        {
          name: "idx_template_id",
          fields: ["template_id"],
        },
      ],
    }
  );
  return CategoryTemplate;
}
