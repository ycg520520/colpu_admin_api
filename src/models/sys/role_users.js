/**
 * @Author: colpu
 * @Date: 2025-09-25 16:16:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-10 22:07:49
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes, Op } from "sequelize";
export default (sequelize, roles, users) => {
  const RoleUsers = sequelize.define('RoleUsers', {
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "角色ID",
      references: { model: roles, key: 'id' },
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "用户ID",
      references: { model: users, key: 'id' },
    },
  },
    {
      tableName: "role_users",
      comment: "用户角色关系表",
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "un_user_role",
          unique: true,
          fields: ["role_id", "user_id"],
        },
        {
          name: "idx_role_id",
          fields: ["role_id"],
        },
        {
          name: "idx_user_id",
          fields: ["user_id"],
        },
      ],
      hooks: {
        beforeCreate: async (RoleUser) => {
          // 创建前验证用户和角色是否存在
          const user = await users.findByPk(RoleUser.user_id);
          const role = await roles.findByPk(RoleUser.role_id);

          if (!user) {
            throw new Error(`用户ID ${RoleUser.user_id} 不存在`);
          }
          if (!role) {
            throw new Error(`角色ID ${RoleUser.role_id} 不存在`);
          }

          if (role.status === 0) {
            throw new Error("无法分配已禁用的角色");
          }

          // 检查是否已存在相同的关系
          const existing = await RoleUser.findOne({
            where: {
              user_id: RoleUser.user_id,
              role_id: RoleUser.role_id,
            },
          });

          if (!existing) {
            throw new Error("该用户角色关系已存在");
          }

          // 检查用户是否已经有该角色（防止重复分配）
          const RoleUsers = await user.getRoles();
          const alreadyHasRole = RoleUsers.some((role) => role.id === RoleUser.role_id);

          if (alreadyHasRole) {
            throw new Error("用户已经拥有该角色");
          }
        },

        // 批量创建前的验证
        beforeBulkCreate: async (RoleUser, options) => {
          const userIds = [...new Set(RoleUser.map((ur) => ur.user_id))];
          const roleIds = [...new Set(RoleUser.map((ur) => ur.role_id))];

          // 验证所有用户是否存在且启用
          const userList = await users.findAll({
            where: {
              id: {
                [Op.in]: userIds
              },
              status: 1,
            },
          });
          if (userList.length !== userIds.length) {
            throw new Error("部分用户不存在");
          }

          // 验证所有角色是否存在且启用
          const roleList = await roles.findAll({
            where: {
              id: {
                [Op.in]: roleIds
              },
              status: 1,
            },
          });
          if (roleList.length !== roleIds.length) {
            throw new Error("部分角色不存在或已禁用");
          }
        },

        afterCreate: async (RoleUser, options) => {
          // 创建后记录日志
          console.log(
            `用户角色关系创建成功: 用户ID ${RoleUser.user_id} - 角色ID ${RoleUser.role_id}`
          );
        },

        afterDestroy: async (RoleUser, options) => {
          // 删除后记录日志
          console.log(
            `用户角色关系删除成功: 用户ID ${RoleUser.user_id} - 角色ID ${RoleUser.role_id}`
          );
        },
      },
    }
  );
  return RoleUsers;
}

