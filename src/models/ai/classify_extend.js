/**
 * @Author: colpu
 * @Date: 2026-04-24 10:17:50
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-25 15:26:42
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const ClassifyExtend = sequelize.define('ClassifyExtend', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    classify_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID，关联classify表id字段'
    },
    feature: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '特色描述'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类图标'
    },
    href: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '跳转地址'
    },
    src: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '图片地址'
    },
    original_src: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '原始图片地址'
    },
    slider_percent: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      comment: '滑块百分比'
    },
    is_auto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否自动播放'
    },
    is_scale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否缩放，默认为false，如果为true则前端需要对图片进行缩放处理，主要针对图像放大修复类的技能，缩放后可以更好的适配不同尺寸的图片，提升修复效果'
    },
    example_right: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '正确示例，JSON格式如: [{ "id": 1, "src": "static/example/right_01.jpg", "size": { "width": 80, "height": 80 } }, { "id": 2, "src": "static/example/right_02.jpg", "size": { "width": 160, "height": 80 } }]'
    },
    example_error: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '错误示例，JSON格式如: [{ "id": 1, "title": "人像过多", "desc": "因多个面容需要进行修复，在修复过程中不确定因素过多，可能会导致修复结果有误。", "src": "static/example/err_01.jpg" }, { "id": 2, "title": "人像缺失", "desc": "大范围破损，遮挡，侵蚀等，在修复过程中无法完好的提取人像要素。", "src": "static/example/err_02.jpg" }, { "id": 3, "title": "非人像", "desc": "修复工具，对于人像修复效果较显著，非人像在修复时无显著效果。", "src": "static/example/err_03.jpg" }]'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "分类扩展状态，0表示禁用，1表示启用",
    },
  }, {
    tableName: 'classify_extend',
    comment: '分类扩展表，存储分类的额外信息，如图标、示例图片等',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  });
  return ClassifyExtend;
}
