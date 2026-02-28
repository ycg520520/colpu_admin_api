/**
 * @Author: colpu
 * @Date: 2025-11-30 18:01:54
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:36:24
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { permissions, dictData, userPermission, users, rolePermission } from "../models/sys/index.js";
import { Op } from "sequelize";
export default class PermissionService extends Base {
  async list(params) {
    const { status, page = 1, pageSize = 20, name } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return permissions.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true
    })
      .then(async (res) => {
        const { rows = [] } = res || {};
        for (const item of rows) {
          const where = {
            perm_id: item.id
          }
          // 查询出所有用户ID
          const user_ids = await userPermission.findAll({
            where,
            attributes: ['user_id'],
            raw: true
          });
          item.user_ids = user_ids.map(item => item.user_id);

          // 查询出所有角色ID
          const role_ids = await rolePermission.findAll({
            where,
            attributes: ['role_id'],
            raw: true
          })
          item.role_ids = role_ids.map(item => item.role_id);
        }
        return this.composePaginationData(res, page, pageSize)
      });
  }
  async findAll() {
    return permissions.findAll({
      where: {
        status: 1
      },
      attributes: ['id', 'name', 'code']
    })
  }

  async tree() {
    const res = await permissions.findAll({
      where: {
        status: 1
      },
      attributes: ['id', 'type', 'name'],
      raw: true // 返回纯对象，而非实例
    });
    const dict = await dictData.findAll({
      where: {
        type_code: 'perm_type'
      },
      attributes: ['label', 'value', 'code'],
      raw: true // 返回纯对象，而非实例
    })
    const dictMap = dict.reduce((map, item) => {
      map[item.code] = {
        key: item.code, // 唯一 key
        disabled: true, // ✅ 不可选中
        checkable: false, // ✅ 如果使用 checkable，分组不参与勾选
        title: item.label,
        value: item.value,
        children: [],
      };
      return map;
    }, {});
    res.forEach((item) => {
      const typeItem = dictMap[item.type];
      if (typeItem) {
        typeItem.children.push({
          key: item.id,
          title: item.name,
          value: item.id,
        });
      }
    })
    return Object.values(dictMap);
  }

  async give({ id, role_ids, user_ids }) {
    const perm = await permissions.findByPk(id);
    if (!perm) {
      throw new Error(`权限ID${id}不存在`);
    }
    if (role_ids) {
      await perm.setRoles(role_ids);
    }
    if (user_ids) {
      await perm.setUsers(user_ids);
    }
    return true;
  }

  async findOne(id) {
    const res = await permissions.findByPk(id);
    if (!res) {
      throw new Error(`权限ID：${id}不存在`);
    }
    return res;
  }
  async create(data) {
    const { name } = data;
    const existing = await permissions.findOne({
      where: {
        name
      }
    });
    if (existing) {
      throw new Error(`岗位${name}已存在`);
    }
    return permissions.create(data);
  }
  async update(data) {
    const { id, ...updateData } = data;
    const res = await permissions.findByPk(id);
    if (!res) {
      throw new Error(`权限ID：${id}不存在`);
    }
    return res.update(updateData);
  }
  async delete(id) {
    const res = await permissions.findByPk(id);
    if (!res) {
      throw new Error(`权限ID：${id}不存在`);
    }
    await res.destroy();
    return true;
  }

  async permUsers(id) {
    const userIds = await userPermission.findAll({
      where: {
        perm_id: id
      },
      attributes: ['user_id'],
      raw: true
    })
    const res = await users.findAll({
      where: {
        id: {
          [Op.in]: userIds.map(item => item.user_id)
        }
      },
      attributes: [['id', 'value'], ['nickname', 'label']],
      raw: true
    });
    return res;
  }
}
