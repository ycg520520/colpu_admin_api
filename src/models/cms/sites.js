/**
 * @Author: colpu
 * @Date: 2025-12-15 15:31:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-10 22:49:20
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Sites = sequelize.define('Sites', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '网站名称'
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '网站logo'
    },
    domain: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '网站域名'
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '邮箱'
    },
    wx: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '微信'
    },
    icp: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ICP备案号'
    },
    copyright: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '版权信息'
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '站点统计代码'
    },
    json: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '万能配置'
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '页面标题'
    },
    keywords: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '页面关键词'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '页面描述'
    },
    template: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'default',
      comment: 'view模板名称'
    },
    upload_type: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1,
      comment: '上传方式 1普通 2七牛云 3阿里云 4腾讯云'
    }
  }, {
    tableName: 'sites',
    comment: '站点信息表',
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
  return Sites;
}
