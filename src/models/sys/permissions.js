/**
 * @Author: colpu
 * @Date: 2025-09-25 16:10:21
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 16:58:59
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
import statusFn from "../../constants/status.js";
export default (sequelize) => {
  const Permissions = sequelize.define('Permissions', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '权限ID'
    },
    parent_id: {
      type: DataTypes.BIGINT,
      comment: '父权限ID，用于权限层级结构'
    },

    // 权限名称（用于展示）
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '权限名称，如：创建用户、查看订单'
    },
    // 权限类型，用于区分权限的类型，如：目录、菜单、按钮、API接口、数据权限模板
    type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '权限类型：DIR-0目录，MENU-1菜单, BUTTON-2按钮, API-3API接口, DATA_SCOPE-4数据权限范围'
    },

    // 核心字段：权限编码（唯一标识），类型：CREATE, READ, UPDATE, DELETE, EXPORT, IMPORT等
    // 命名规则：类型:资源:操作，如：
    // sys:menu:read // 用户拥有菜单页面，可以通过路由访问
    // sys:user:create, // 在用户页面拥有创建用户权限的按钮操作权限
    // api:user:read, // 用户拥有用户列表API接口权限
    // scope:user:delete, // 用户拥有删除用户数据权限
    perm_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: '权限编码，如：user:create, order:read'
    },
    // 后端接口HTTP方式，控制是否可访问其接口
    method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
      allowNull: true
    },
    // 后端接口path，控制是否可访问其接口
    path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '权限路径，如：/system/user/create'
    },

    // 数据权限范围
    scope_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'scope_type',
      comment: '权限作用范围：all:0-全部数据权限,dept_blow:1-本部门及以下数据权限,dept:2-仅本部门数据权限,self:3-仅本人数据权限,custom:4-自定义数据权限'
    },
    scope_config: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: `
        {
          "departments": [department_id1, department_id2], // 部门id，scope_type为COMPANY或DEPARTMENT或CUSTOM时有效
          "users": [userid1, userid2], // 用户id USER时有效
        }
      `,
    },

    // 关联菜单IDS（可选）
    menu_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '关联菜单IDS'
    },

    // 描述（可选）
    remark: {
      type: DataTypes.TEXT,
      comment: '权限描述，说明该权限的作用'
    },

    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },

    // 是否可编辑，0可编辑，1禁止编辑
    editable: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "编辑状态，0可编辑，1禁止编辑",
    },
    status: statusFn('参数不正确'),
    created_by: {
      type: DataTypes.BIGINT,
      comment: '创建人ID'
    },
    updated_by: {
      type: DataTypes.BIGINT,
      comment: '更新人ID'
    },
    deleted_at: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      comment: '删除时间（软删除）'
    },
  }, {
    tableName: "permissions",
    comment: '功能权限表 - 定义系统所有可授权的操作',
    paranoid: true, // 启用软删除
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        name: 'idx_perm_code',
        fields: ['perm_code']
      },
      {
        name: 'idx_parent_id',
        fields: ['parent_id']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
    ],
  }
  );
  return Permissions;
}
