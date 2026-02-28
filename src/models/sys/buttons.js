/**
 * @Author: colpu
 * @Date: 2025-10-28 22:13:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-17 23:11:42
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
// -- 菜单表
// CREATE TABLE menus (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   parent_id INT DEFAULT NULL,
//   name VARCHAR(100) NOT NULL COMMENT '菜单名称',
//   path VARCHAR(200) COMMENT '路由路径',
//   lazy VARCHAR(200) COMMENT '前端组件',
//   icon VARCHAR(100) COMMENT '菜单图标',
//   sort INT DEFAULT 0 COMMENT '排序',
//   level INT DEFAULT 1 COMMENT '菜单层级',
//   is_show BOOLEAN DEFAULT TRUE COMMENT '是否显示',
//   is_cache BOOLEAN DEFAULT TRUE COMMENT '是否缓存',
//   redirect VARCHAR(200) COMMENT '重定向路径',
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE
// );
export default (sequelize) => {
  const Buttons = sequelize.define('Buttons', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'menus',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('button', 'link', 'dropdown'),
      defaultValue: 'button'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
  }, {
    tableName: 'buttons',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  });
  return Buttons;
}
