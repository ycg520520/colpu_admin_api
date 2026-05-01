/**
 * @Author: colpu
 * @Date: 2026-04-23 12:52:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-24 10:17:50
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类名称'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '描述'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类图标'
    },
    banner: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类banner图'
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类地址'
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '使用数量'
    },
    // 以下字段后期可分离出去另外一张表存储，暂时放在一起方便开发
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '模型名称'
    },
    upload_opt: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [{ tip: "上传您的照片" }],
      comment: '上传配置存储字段，决定上传图片数量，JSON格式如: [{ "tip": "上传您的照片" }, { "tip": "上传您老公的照片" }]'
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
    aspect_ratio: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '3:4',
      comment: '默认宽高比'
    },
    enable_crop: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '是否启用裁剪，0表示不启用，1表示启用'
    },
    enable_face_detect: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '是否启用人脸检测，0表示不启用，1表示启用'
    },
    enable_grid_split: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '是否启用网格切分，0表示不启用，1表示启用'
    },
    enable_enhance: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: '是否启用增强，0表示不启用，1表示启用'
    },
    cost_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: '扣点值'
    },
    cost_point_hd: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
      comment: '高清扣点值'
    },
    size: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '1K',
      comment: '普通图片尺寸'
    },
    size_hd: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '2K',
      comment: '高清图片尺寸'
    },
    output_width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '输出宽度'
    },
    output_height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '输出高度'
    },
    output_dpi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 72,
      comment: '输出分辨率'
    },
    // 以上字段后期可分离出去另外一张表存储，end
    is_hot: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "是否为热门，0表示普通，1表示热门",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: '描述'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "分类状态，0表示禁用，1表示启用",
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
  });
  return Classify;
}
