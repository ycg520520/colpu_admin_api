/**
 * @Author: colpu
 * @Date: 2025-11-20 08:57:42
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-07 18:33:00
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { roles, menus, users, rolePermission } from "../models/sys/index.js";
import { Op, } from "sequelize";
export default class RoleService extends Base {
  roleList(params) {
    const { name, status = 1, page = 1, pageSize = 20 } = params;
    const where = {
      status
    };
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `LIKE '%${name}%'` } });
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    // 原始查询，效率更高
    return roles.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true
    }
    ).then(async (res) => {
      const { rows = [] } = res || {};
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        const res = await rolePermission.findAll({
          where: {
            role_id: item.id
          },
          raw: true
        })
        item.perm_ids = res.map(item => item.perm_id);
      }
      return this.composePaginationData(res, page, pageSize);
    })
  }

  roleAll(attributes = ['id', 'name', 'code']) {
    return roles.findAll({
      where: {
        status: 1
      },
      attributes
    })
  }

  async createRole(data) {
    const { name, code, status, remark, sort_order } = data;
    const existing = await roles.findOne({
      where: { name, }
    });
    if (existing) {
      throw new Error(`角色${name}已存在`);
    }
    return roles.create({
      name,
      code,
      status, sort_order, remark
    });
  }

  async updateRole(data) {
    const { id, ...update } = data;
    const role = await roles.findByPk(id);
    if (!role) {
      throw new Error(`角色ID：${id}不存在`);
    }
    return role.update(update);
  }
  async deleteRole(id) {
    const res = await roles.findByPk(id);
    if (!res) {
      throw new Error(`角色ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }

  async getRoleUser(param) {
    const { role_id, page = 1, pageSize = 20, username, phone, status } = param;
    const role = await roles.findByPk(role_id);
    if (!role) {
      throw new Error(`角色ID${role_id}不存在`);
    }
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = [];
    if (username) {
      orArr.push({ username: { [Op.like]: `%${username}%` } });
    }
    if (phone) {
      orArr.push({ phone: { [Op.like]: `%${phone}%` } });
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return users.findAndCountAll({
      where,
      include: [{
        model: roles,
        where: { id: role_id },
        attributes: [],
        through: { attributes: [] }
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      // order: [['id', 'ASC']], // 排序
      distinct: true // 重要：避免因 JOIN 导致的重复数据
    }).then(({ count, rows }) => {
      return this.composePaginationData({ rows, count }, page, pageSize);
    });
  }

  async createRoleUser(data) {
    const { role_id, user_ids } = data;
    const role = await roles.findByPk(role_id);
    if (!role) {
      throw new Error(`角色ID${role_id}不存在`);
    }
    return role.addUsers(user_ids);
  }

  async deleteRoleUser(data) {
    const { role_id, user_ids } = data;
    const role = await roles.findByPk(role_id);
    if (!role) {
      throw new Error(`角色ID${role_id}不存在`);
    }
    return role.removeUsers(user_ids);
  }

  // 角色分配权限
  async rolePermission({ perm_ids, role_id }) {
    const role = await roles.findByPk(role_id);
    if (!role) {
      throw new Error(`角色ID${role_id}不存在`);
    }
    return role.setPermissions(perm_ids);
  }
}
