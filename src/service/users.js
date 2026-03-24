/**
 * @Author: colpu
 * @Date: 2024-06-20 14:49:51
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 16:26:46
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Op, col } from "sequelize";
import Base from "./base.js";

import { users, departments, post, roles, userDepartments, userPost, roleUsers, menus, permissions } from "../models/sys/index.js";
export default class UserService extends Base {
  /**
   * @function findUserByNameAndPass 查找用户
   * @description 通过用户名和密码查找用户
   * @param {Object} params @required (必需)
   * {
      username: {String} @required
      password: {String} @required
   * }
   * @param {Array} attributes (可选) 输出的查询字段
   */
  async findUserByNameAndPass(params, attributes) {
    const { password, username } = params;
    return this.findUser({ password, username }, attributes)
  }
  async findUser(where, attributes = []) {
    return users.findOne({
      attributes: attributes.length
        ? attributes
        : [
          "id",
          "uid",
          "avatar",
          "username",
          "nickname",
          "gender",
          "phone",
          "email",
          "status",
          "country",
          "province",
          "city",
          "year",
          "created_at",
          "updated_at",
        ],
      where
    });
  }

  async findUserRole(id) {
    return users.findAll({
      where: {
        id,
      },
      attributes: [[col('Roles.id'), 'id'], [col('Roles.code'), 'code']],
      include: [
        {
          model: roles,
          where: {
            status: 1,
          },
          attributes: [],
          through: {
            attributes: []
          },
        },
      ],
      raw: true,
    });
  }

  async findUserRoleAndPermission(user_id) {
    const attributes = [
      [col('Permissions.perm_code'), 'perm_code'],
      [col('Permissions.menu_ids'), 'menu_ids'],
      [col('Permissions.type'), 'type']];
    const userRoles = await this.findUserRole(user_id);
    const userPerms = await users.findAll({
      where: {
        id: user_id,
      },
      include: [{
        model: permissions,
        where: {
          perm_code: {
            [Op.ne]: null,
          }
        },
        attributes: [],
        through: { attributes: [] }
      }],
      attributes,
      raw: true
    });

    const role_ids = [];
    // 默认角色权限为空
    const rolePerms = [];
    if (userRoles && userRoles.length) {
      role_ids.push(...userRoles.map(r => r.id));
      const res = await roles.findAll({
        where: {
          id: {
            [Op.in]: role_ids,
          },
          status: 1,
        },
        attributes,
        include: [{
          model: permissions,
          attributes: [],
          through: { attributes: [] }
        }],
        raw: true
      });
      if (res.length) {
        rolePerms.push(...res);
      }
    }
    // 用户权限和角色权限合并
    const permList = [...userPerms, ...rolePerms];
    // 找出非菜单权限
    const permCodes = permList.filter(item => item.type != 'menu').map(item => item.perm_code);

    // 找出菜单权限
    const menuPermList = permList.filter(item => item.type == 'menu').map(item => item.menu_ids);
    const menuPerm = [...new Set(menuPermList.flat())]; // 去重
    const menuList = await menus.findAll({
      where: {
        id: {
          [Op.in]: menuPerm,
        },
        status: 1,
      },
      attributes: ['perm_code'],
    })
    const menuPermCodes = menuList.map(item => item.perm_code);
    return {
      roles: role_ids,
      permissions: [...permCodes, ...menuPermCodes],
    };
  }

  async userList(params) {
    const { status, page = 1, pageSize = 20, username, dept_id } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (username) {
      orArr.push({ username: { [Op.like]: `%${username}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    let ids = []
    if (dept_id) {
      ids = await departments.findAll({ raw: true }).then(res => {
        const totalLen = res.length;
        const data = this.utils.installTree(res, { id: dept_id, key_fid: 'parent_id', mode: 'array', })
        const ids = data.map(item => item.id);
        // 这里判断部门和查询部门是否一致，如果一致则返回空数组，否则返回ids，空数组时默认查询全部
        return totalLen === ids.length ? [] : ids;
      });
    }

    return users.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: ids.length ? [{
        model: departments,
        where: {
          id: {
            [Op.in]: ids
          }
        },
        attributes: [], // 不返回部门信息，只做过滤
        through: {
          attributes: [] // 不返回关联表字段
        }
      }] : [],
    }).then(async (res) => {
      const { rows = [] } = res || {};
      const ids = rows.map(item => item.id);
      const where = {
        user_id: {
          [Op.in]: ids
        }
      }
      const deptList = await userDepartments.findAll({
        where
      });
      const postList = await userPost.findAll({
        where,
      });
      const roleList = await roleUsers.findAll({
        where,
      });
      rows.forEach(item => {
        item.dataValues.dept_ids = deptList.filter(dept => dept.user_id === item.id).map(item => item.dept_id);
        item.dataValues.post_ids = postList.filter(post => post.user_id === item.id).map(item => item.post_id);
        item.dataValues.role_ids = roleList.filter(role => role.user_id === item.id).map(item => item.role_id);
      })
      return this.composePaginationData(res, page, pageSize);
    });
  }

  register(params) {
    return this.create(params);
  }

  /**
   * @function 创建用户，返回添加用户信息
   * @params {Object} data 用户相关字段
   * {
   *  type: // 分类类型，Null代表公用类型, 1代表漫画，2代表音乐
   * }
   */
  async create(params) {
    let { password, avatar } = params;
    // 创建用户时，指定用户初使密码为默认12345678
    params.password = password ? password : "12345678";

    // 不存在默认一个图标
    if (!avatar) {
      params.avatar = "assets/foindia.png-normal";
    }

    const res = await users.create(params);
    return res;
  }
  /**
   * @function 更新用户
   * @param params
    {
      id: {Number}, // @required 用户id自增
      username: {String}, // 用户名称
      nickusername: {String}, // 用户名字昵称
      password: {String}, // 密码
      phone: {Number}, // 电话号码
      email: {String}, // 邮箱
      status: {Number}, // 用户状态，0表示禁用，1表示启用
    }
   */
  async update(data) {
    const { id, post_ids, role_ids, dept_ids, ...updateData } = data;
    const res = await users.findByPk(id);
    if (!res) {
      throw new Error(`角色ID：${id}不存在`);
    }
    await this._related(res, { post_ids, role_ids, dept_ids });
    return res.update(updateData);
  }

  async _related(res, { dept_ids, post_ids, role_ids, operate = 'set' }) {
    if (dept_ids && dept_ids.length > 0) {
      const deptList = await departments.findAll({
        where: {
          id: {
            [Op.in]: dept_ids
          }
        }
      });
      await res[`${operate}Departments`](deptList);
    }
    if (post_ids && post_ids.length > 0) {
      const postList = await post.findAll({
        where: {
          id: {
            [Op.in]: post_ids
          }
        }
      });
      await res[`${operate}Posts`](postList);
    }
    if (role_ids && role_ids.length > 0) {
      const roleList = await roles.findAll({
        where: {
          id: {
            [Op.in]: role_ids
          }
        }
      });
      await res[`${operate}Roles`](roleList);
    }
  }

  async delete(id) {
    const user = await users.findByPk(id);
    if (!user) {
      throw new Error(`不存在用户ID:${id}`);
    }
    const where = {
      user_id: id
    }
    const deptList = await userDepartments.findAll({ where });
    if (deptList && deptList.length) {
      await user.setDepartments([]); // 先清空关联
    }
    const postList = await userPost.findAll({ where });
    if (postList && postList.length) {
      await user.setPosts([]); // 清空岗位关联
    }
    const roleList = await roleUsers.findAll({ where });
    if (roleList && roleList.length) {
      await user.setRoles([]); // 清空角色关联
    }
    await user.destroy();
    return true;
  }

  _tripartSQL(uid) {
    return `SELECT uid,type,openid,unionid FROM third_auth WHERE uid='${uid}' AND isbind=1;`;
  }

  userVipInfo(params) {
    let sql = `SELECT vip_expire FROM user WHERE uid='${params.uid}'`;
    return this.app.mysql
      .use("user")
      .query(sql)
      .then((res) => res[0][0]);
  }

  async check(params) {
    const { replacements, values } = this.installParams(params, 2);
    let sql = `SELECT uid FROM user WHERE ${values}`;
    return this.app.mysql
      .use("user")
      .query(sql, { replacements })
      .then((res) => res[0][0]);
  }

  async search({ keyword }, attributes) {
    const where = {
      status: 1
    };
    const orArr = []
    // 全部是数字搜索手机号码
    if (/^\d+$/.test(keyword)) {
      orArr.push({ phone: { [Op.like]: `%${keyword}%` } })
    } else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(keyword)) {
      orArr.push({ email: { [Op.like]: `%${keyword}%` } })
    } else if (!!keyword) {
      orArr.push({ nickname: { [Op.like]: `%${keyword}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return users.findAll({
      where,
      attributes
    });
  }
}
