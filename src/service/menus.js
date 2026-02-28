/**
 * @Author: colpu
 * @Date: 2025-10-29 16:22:49
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:33:19
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { menus, roles, users, permissions, userPermission, roleUsers, rolePermission } from "../models/sys/index.js";
import { Op } from "sequelize";
export default class MenusService extends Base {
  async routes(id) {
    // 一、获取用户分配权限ID
    const userPerm = await userPermission.findAll({
      where: {
        user_id: id
      },
      attributes: ['perm_id'],
      raw: true
    })
    // 二步、获取用户的角色，并通过用户关联的角色，获取权限ID
    const rolePerm = []
    // 1、获取用户角色数组
    const roleRes = await roleUsers.findAll({
      where: {
        user_id: id
      },
      attributes: ['role_id'],
      raw: true
    });
    // 2、如果存在角色权限数组
    if (roleRes.length) {
      // a、角色ID数组
      const roleIds = roleRes.map(r => r.role_id);
      // b、通过角色ID，获取角色权限数组
      const permRes = await rolePermission.findAll({
        where: {
          role_id: {
            [Op.in]: roleIds
          },
        },
        attributes: ['perm_id'],
        raw: true
      });
      // c、获取权限ID数组
      rolePerm.push(...permRes.map(r => r.perm_id));
    }

    // 三步、组装合并用户权限ID和角色权限ID，查询出对应菜单
    const permIds = [...new Set([...userPerm.map(r => r.perm_id), ...rolePerm])];
    // a、获取权限列表
    const permList = await permissions.findAll({
      where: {
        id: {
          [Op.in]: permIds
        }
      },
      attributes: ['menu_ids', 'perm_code'],
      raw: true
    });
    // 查询条件
    const where = {
      status: 1,
      menu_type: {
        [Op.ne]: 2 // 排除按钮
      }
    };

    // b、通过权限列表判断是否具有全部权限
    const hasAll = permList.some(p => p.perm_code === '*:*:*');
    // d、通过权限列表，获取菜单ID数组
    const menuIds = [...new Set(permList.map(p => p.menu_ids).flat())];
    if (!hasAll) {
      where.id = {
        [Op.in]: menuIds
      };
    }
    // 查询出所有菜单列表
    return menus.findAll({
      where
    }).then((res) => {
      return res.map((item) => {
        return item.formatRoutes();
      })
    });
  }
  all(params) {
    const { title, status } = params;
    const where = {};
    if (status !== undefined) where.status = status;

    const orArr = []
    if (title) {
      orArr.push({ name: { [Op.like]: `%${title}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return menus.findAndCountAll({
      where,
      // offset: (page - 1) * pageSize,
      // limit: parseInt(pageSize),
    })
  }
  tree() {
    const attributes = ['id', 'parent_id', 'title', 'menu_type'];
    return menus.findAll({
      where: {
        status: true,
      },
      attributes
    })
  }
  async findOne(id) {
    const res = await menus.findByPk(id);
    if (!res) {
      throw new Error(`菜单ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { menu_type, title, name, parent_id } = data;
    if ([0, 1].includes(menu_type) && parent_id) {
      const existing = await menus.findOne({
        where: {
          parent_id,
          menu_type,
          [Op.or]: [{ name }, { title }]
        }
      });
      if (existing) {
        throw new Error(`菜单${name}或者${title}已存在`);
      }
    } else if (parent_id && menu_type === 2) {
      const existing = await menus.findOne({
        where: {
          parent_id,
          menu_type,
          [Op.or]: [{ title }]
        }
      });
      if (existing) {
        throw new Error(`按钮${title}已存在`);
      }
    }

    return menus.create(data);
  }
  async update(data) {
    // layout 字段单独处理，如果没有传则更新为NULL默认值
    const { id, layout = null, ...updateData } = data;
    const res = await menus.findByPk(id);

    if (!res) {
      throw new Error(`菜单ID：${id}不存在`);
    }
    console.log({ ...updateData, layout })
    return res.update({ ...updateData, layout });
  }
  async delete(id) {
    const res = await menus.findByPk(id);
    if (!res) {
      throw new Error(`菜单ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }
}
