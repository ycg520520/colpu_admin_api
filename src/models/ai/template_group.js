/**
 * @Author: colpu
 * @Date: 2026-06-06 16:58:45
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-13 17:26:13
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const TemplateGroup = sequelize.define('TemplateGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    classify_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分类ID'
    },
    category_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '类别ids'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分组名称'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分组标题，用于前端标题显示'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    remark: {
      type: DataTypes.STRING(500),  // 数据类型为字符串，长度500
      comment: '描述'              // 字段注释
    },
  }, {
    tableName: 'template_group',
    comment: '模版分组表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  });
  return TemplateGroup;
}
