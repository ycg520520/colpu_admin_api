/**
 * @Author: colpu
 * @Date: 2026-04-23 12:52:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-10 13:32:53
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Template = sequelize.define('Template', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '模版名称'
    },
    img_src: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '模版图片'
    },
    img_width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '模版图片宽度'
    },
    img_height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '模版图片高度'
    },
    line_art_src: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '线稿图片地址'
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '提示词存储字段， 存在变量则存储在prompt_variables字段，变量用`{XXX}`占位'
    },
    prompt_variables: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '提示词变量存储字段，JSON格式如: [{"label": "XXX", "values": ["value1", "value2"]}]'
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
      comment: "模版状态，0表示禁用，1表示启用",
    },
  }, {
    tableName: 'template',
    comment: '模版表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  });
  return Template;
}
