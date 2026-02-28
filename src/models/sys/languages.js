/**
 * @Author: colpu
 * @Date: 2025-10-31 08:46:08
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-29 23:24:58
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
// models/Language.js
import { DataTypes } from 'sequelize';
// CREATE TABLE languages (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   code VARCHAR(20) NOT NULL UNIQUE COMMENT '语言代码，如：zh-CN, en-US',
//   name VARCHAR(100) NOT NULL COMMENT '语言名称',
//   native_name VARCHAR(100) COMMENT '本地语言名称',
//   is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认语言',
//   is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );
export function languagesModel(sequelize) {
  const Languages = sequelize.define('Languages', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    native_name: {
      type: DataTypes.STRING(100)
    },
    is_default: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1
    }
  }, {
    tableName: 'languages',
    comment: '语言表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        name: "idx_code",
        fields: ['code']
      }
    ]
  });

  return Languages;
};

// CREATE TABLE translations (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   language_code VARCHAR(20) NOT NULL COMMENT '语言代码',
//   namespace VARCHAR(100) DEFAULT 'common' COMMENT '命名空间，用于分类',
//   `key` VARCHAR(500) NOT NULL COMMENT '翻译键',
//   value TEXT NOT NULL COMMENT '翻译文本',
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   FOREIGN KEY (language_code) REFERENCES language_packs(code),
//   INDEX idx_language_namespace (language_code, namespace),
//   INDEX idx_key_namespace (`key`, namespace)
// );
export function translationsModel(sequelize) {
  const Translations = sequelize.define('Translations', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    language_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    namespace: {
      type: DataTypes.STRING(100),
      defaultValue: 'common'
    },
    key: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'translations',
    comment: '翻译表',
    timestamps: true,
    underscored: true,
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        fields: ['language_code', 'namespace']
      },
      {
        fields: ['key', 'namespace']
      }
    ]
  });

  return Translations;
};
