/**
 * @Author: colpu
 * @Date: 2025-12-15 15:21:10
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 15:23:40
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const ArticleTags = sequelize.define('ArticleTags', {
    article_id: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '文章ID'
    },
    tag_id: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '标签ID'
    },
  }, {
    tableName: 'article_tags',
    comment: '文章-标签关联表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        name: "unique_article_tag",
        unique: true,
        fields: ["article_id", "tag_id"],
      },
      {
        name: "idx_article_id",
        fields: ["article_id"],
      },
      {
        name: "idx_tag_id",
        fields: ["tag_id"],
      },
    ],
    hooks: {
    },
  });
  return ArticleTags;
}
