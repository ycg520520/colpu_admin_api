/**
 * @Author: colpu
 * @Date: 2025-11-22 19:43:02
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 16:58:23
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

import { DataTypes } from "sequelize";
import statusFn from "../../constants/status.js";
export default (sequelize) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: "岗位ID",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "岗位名称",
      validate: {
        notEmpty: true,
      },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "岗位编码",
      validate: {
        notEmpty: true,
      },
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "排序",
    },
    status: statusFn(),
  },
    {
      tableName: "post",
      comment: "岗位表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { name: "idx_code", fields: ["code"] },
      ],
    }
  )
  return Post;
}
