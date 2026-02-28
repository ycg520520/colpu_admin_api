/**
 * @Author: colpu
 * @Date: 2025-11-23 11:02:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-07 15:35:59
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
// -- 用户岗位关系表
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const UserPosts = sequelize.define('UserPosts', {
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "用户ID",
      validate: {
        notNull: {
          msg: "用户ID不能为空",
        },
        min: 1,
      },
    },
    post_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "岗位ID",
      validate: {
        notNull: {
          msg: "岗位ID不能为空",
        },
        min: 1,
      },
    },
  },
    {
      tableName: "user_posts",
      comment: "用户岗位关系表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "uk_user_post",
          unique: true,
          fields: ["user_id", "post_id"],
        },
        {
          name: "idx_user_id",
          fields: ["user_id"],
        },
        {
          name: "idx_post_id",
          fields: ["post_id"],
        },
      ],
    }
  );
  return UserPosts;
}
