/**
 * @Author: colpu
 * @Date: 2025-12-11 09:08:11
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-02 00:18:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Classify = sequelize.define('Classify', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references: {
      //   model: "Classify",
      //   key: 'id'
      // },
      comment: '父级ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类名称'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类图标'
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '栏目标识'
    },
    path: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '栏目路径'
    },
    type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '分类类型默认值为0，即公用分类，1-文章分类，2-产品分类，3-项目分类，4-案例分类，5-新闻分类',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'SEO标题'
    },
    keywords: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'SEO关键字'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'SEO描述'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    template: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '内容模板'
    },
    template_list: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '列表模板'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "分类状态，0表示禁用，1表示启用",
    },
    editable: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "编辑状态，0可编辑，1禁止编辑",
    },
  }, {
    tableName: 'classify',
    comment: '分类表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
    }
  });
  return Classify;
}
