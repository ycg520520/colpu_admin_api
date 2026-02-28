/**
 * @Author: colpu
 * @Date: 2025-10-28 21:54:30
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-07 15:48:24
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

import { DataTypes } from "sequelize";
export default (sequelize, roles, menus) => {
  const RoleMenus = sequelize.define('RoleMenus', {
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "角色ID",
      references: {
        model: roles,
        key: 'id'
      },
      validate: {
        notNull: {
          msg: "角色ID不能为空",
        },
        min: 1,
      },
    },
    menu_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "菜单ID",
      references: {
        model: menus,
        key: 'id'
      },
      validate: {
        notNull: {
          msg: "菜单ID不能为空",
        },
        min: 1,
      },
    }
  },
    {
      tableName: "role_menus",
      comment: "角色菜单关联表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "unique_role_menu",
          unique: true,
          fields: ["role_id", "menu_id"],
        },
        {
          name: "idx_role_id",
          fields: ["role_id"],
        },
        {
          name: "idx_menu_id",
          fields: ["menu_id"],
        },
      ],
    }
  );
  return RoleMenus;
}
