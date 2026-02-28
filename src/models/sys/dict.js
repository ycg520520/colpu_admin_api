/**
 * @Author: colpu
 * @Date: 2025-10-30 15:41:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-03 20:38:46
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";

/**
 * 字典类型模型定义
 * @param {Object} sequelize - Sequelize实例
 * @returns {Model} 返回定义好的DictType模型
 */
export const dictTypesModel = (sequelize) => {
  // 定义DictType模型，用于字典类型表
  const DictTypes = sequelize.define('DictTypes', {
    id: {
      type: DataTypes.INTEGER, // 数据类型为整数
      primaryKey: true,       // 主键
      autoIncrement: true,    // 自增
      comment: '主键ID'       // 字段注释
    },
    type_code: {
      type: DataTypes.STRING(100),  // 数据类型为字符串，长度100
      allowNull: false,             // 不允许为空
      unique: true,                // 唯一约束
      comment: '字典类型编码'       // 字段注释
    },
    name: {
      type: DataTypes.STRING(100),  // 数据类型为字符串，长度100
      allowNull: false,             // 不允许为空
      comment: '字典类型名称'       // 字段注释
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
    sort_order: {
      type: DataTypes.INTEGER,     // 数据类型为整数
      defaultValue: 0,             // 默认值为0
      comment: '排序'              // 字段注释
    },
    editable: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "编辑状态，0可编辑，1禁止编辑",
    },
  }, {
    tableName: 'dict_types',      // 指定表名
    comment: '字典类型表',  // 表注释
    underscored: true,           // 启用下划线命名风格
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [                   // 定义索引
      { fields: ['type_code'] },  // type_code 字段的索引
      { fields: ['status'] }      // status 字段的索引
    ]
  });
  return DictTypes;  // 返回定义好的模型
};

/**
 * 字典数据模型定义函数
 * @param {Object} sequelize - Sequelize实例对象
 * @returns {Object} 返回定义好的DictData模型
 */
export const dictDataModel = (sequelize) => {
  // 定义DictData模型
  const DictData = sequelize.define('DictData', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,  // 设置为主键
      autoIncrement: true,  // 自增
      comment: '主键ID'  // 字段注释
    },
    type_code: {
      type: DataTypes.STRING(100),  // 字符串类型，长度100
      allowNull: false,  // 不允许为空
      comment: '字典类型编码'  // 字段注释
    },
    code: {
      type: DataTypes.STRING(100),  // 字符串类型，长度100
      allowNull: false,  // 不允许为空
      comment: '字典数据编码'  // 字段注释
    },
    value: {
      type: DataTypes.INTEGER,  // 字符串类型，长度500
      allowNull: false,  // 不允许为空
      comment: '字典数据值'  // 字段注释
    },
    label: {
      type: DataTypes.STRING(200),  // 字符串类型，长度200
      allowNull: false,  // 不允许为空
      comment: '显示标签'  // 字段注释
    },
    sort_order: {
      type: DataTypes.INTEGER,  // 整数类型
      defaultValue: 0,  // 默认值为0
      comment: '排序'  // 字段注释
    },
    status: {
      type: DataTypes.TINYINT(1),  // 微小整数类型
      defaultValue: 1,  // 默认值为1
      comment: '状态：0-禁用，1-启用'  // 字段注释
    },
    is_default: {
      type: DataTypes.TINYINT(1),  // 微小整数类型
      defaultValue: 0,  // 默认值为0
      comment: '是否默认：0-否，1-是'  // 字段注释
    },
    css_class: {
      type: DataTypes.STRING(100),  // 字符串类型，长度100
      comment: 'CSS类名'  // 字段注释
    },
    remark: {
      type: DataTypes.STRING(500),  // 字符串类型，长度500
      comment: '描述'  // 字段注释
    },
    editable: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "编辑状态，0可编辑，1禁止编辑",
    },
    // created_by: {
    //   type: DataTypes.STRING(100),  // 字符串类型，长度100
    //   comment: '创建人'  // 字段注释
    // },
    // updated_by: {
    //   type: DataTypes.STRING(100),  // 字符串类型，长度100
    //   comment: '更新人'  // 字段注释
    // }
  }, {
    tableName: 'dict_data',  // 指定表名
    comment: '字典数据表',  // 表注释
    underscored: true,  // 自动将字段名转换为下划线格式
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      { fields: ['type_code', 'code'] },  // 复合索引
      { fields: ['type_code', 'status'] },  // 复合索引
      { fields: ['sort_order'] }  // 单字段索引
    ]
  });

  return DictData;
};
