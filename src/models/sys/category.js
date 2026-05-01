/**
 * @Author: colpu
 * @Date: 2025-12-03 20:38:46
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-23 15:06:20
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";

export const categoryTypeModel = (sequelize) => {
  // 定义DictType模型，用于字典类型表
  const CategoryType = sequelize.define('categoryType', {
    id: {
      type: DataTypes.INTEGER, // 数据类型为整数
      primaryKey: true,       // 主键
      autoIncrement: true,    // 自增
      comment: '主键ID'       // 字段注释
    },
    name: {
      type: DataTypes.STRING(100),  // 数据类型为字符串，长度100
      allowNull: false,             // 不允许为空
      comment: '类别类型名称'       // 字段注释
    },
    remark: {
      type: DataTypes.STRING(500),  // 数据类型为字符串，长度500
      comment: '描述'              // 字段注释
    },
    status: {
      type: DataTypes.TINYINT,     // 数据类型为 tinyint
      defaultValue: 1,             // 默认值为1
      comment: '状态：0-禁用，1-启用' // 字段注释
    },
  }, {
    tableName: 'category_type',      // 指定表名
    comment: '类别类型表',  // 表注释
    underscored: true,           // 启用下划线命名风格
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  });
  return CategoryType;  // 返回定义好的模型
};

/**
 * 类别数据模型定义函数
 * @param {Object} sequelize - Sequelize实例对象
 * @returns {Object} 返回定义好的Category模型
 */
export const categoryModel = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '父级ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '类别名称'
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '类别标识'
    },
    type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      allowNull: false,
      comment: '类别类型：0-全局系统，1-CMS，2-AI，3-...详见category_type表',
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
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "类别状态，0表示禁用，1表示启用",
    }
  }, {
    tableName: 'category',
    comment: '类别表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {}
  });
  return Category;
}
