/**
 * @Author: colpu
 * @Date: 2025-10-11 11:13:07
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-07 21:43:38
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 用户管理控制器
 */
export default class UserController extends Controller {
  /**
   * @api {get} /user/info
   * @apiName getUserInfo
   * @apiDescription 获取当前登录用户信息
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Object} data 用户信息（含 roles、permissions）
   */
  async getUserInfo(ctx) {
    const { uid } = ctx.state.user;
    const { dataValues } = await this.service.users.findUser({
      uid,
    });
    const { roles, permissions } = await this.service.users.findUserRoleAndPermission(dataValues.id)
    dataValues.roles = roles;
    dataValues.permissions = permissions;
    ctx.respond(dataValues);
  }

  /**
   * @api {get} /user/search
   * @apiName searchUserList
   * @apiDescription 根据关键词搜索用户列表
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} keyword 搜索关键词（支持昵称、手机、邮箱）
   * @apiSuccess {Array} data 用户列表 [{id, value}, {nickname, label}]
   */
  async searchUserList(ctx) {
    const params = ctx.validateAsync({
      query: {
        keyword: Joi.string().required(),
      },
    });
    const data = await this.service.users.search(params, [['id', 'value'], ['nickname', 'label']]);
    ctx.respond(data);
  }

  /**
   * @api {get} /user/list
   * @apiName getUserList
   * @apiDescription 分页获取用户列表
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiQuery {Number} [dept_id] 部门ID（可选，按部门筛选）
   * @apiSuccess {Object} data 分页用户列表
   */
  async getUserList(ctx) {
    const params = ctx.validateAsync(ctx.utils.schemaPagination({ dept_id: Joi.number() }));
    const data = await this.service.users.userList(params);
    ctx.respond(data);
  }

  /**
   * @api {post} /user
   * @apiName createUser
   * @apiDescription 创建用户
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} username 用户名 (必需)
   * @apiBody {String} password 密码 (必需)
   * @apiSuccess {Object} data 创建的用户信息
   */
  async createUser(ctx) {
    ctx.validateAsync({
      body: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
    });

    const data = await this.service.users.create(ctx.request.body);
    ctx.respond(data);
  }

  /**
   * @api {delete} /user
   * @apiName deleteUser
   * @apiDescription 删除用户
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 用户ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteUser(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.users.delete(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  }

  /**
   * @api {put} /user
   * @apiName updateUser
   * @apiDescription 更新用户信息
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} id 用户ID (必需)
   * @apiBody {String} [username] 用户名
   * @apiBody {String} [password] 密码
   * @apiBody {String} [nickname] 昵称
   * @apiBody {Number} [status] 状态
   * @apiSuccess {Object} data 更新后的用户信息
   */
  async updateUser(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.users.update(ctx.request.body);
    ctx.respond(data);
  }

  /**
   * @api {get} /user/role
   * @apiName getUserRole
   * @apiDescription 获取当前用户角色
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 用户角色列表
   */
  async getUserRole(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserRole({
      uid,
    });
    ctx.respond(data);
  }

  /**
   * @api {put} /user/role/:uid
   * @apiName updateUserRole
   * @apiDescription 更新用户角色
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiBody {String} role 角色信息 (必需)
   * @apiSuccess {Object} data 更新结果
   */
  async updateUserRole(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
      body: {
        role: Joi.string().required(),
      },
    });
    const data = await this.service.users.updateUserRole(ctx.params.uid, ctx.request.body);
    ctx.respond(data);
  }

  /**
   * @api {delete} /user/role/:uid
   * @apiName deleteUserRole
   * @apiDescription 删除用户角色
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteUserRole(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserRole(ctx.params.uid);
    ctx.respond(data);
  }

  /**
   * @api {get} /user/permission
   * @apiName getUserPermission
   * @apiDescription 获取当前用户权限
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Object} data 用户角色与权限
   */
  async getUserPermission(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserRoleAndPermission({
      uid,
    });
    ctx.respond(data);
  }

  /**
   * @api {put} /user/permission/:uid
   * @apiName updateUserPermission
   * @apiDescription 更新用户权限
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiBody {String} permission 权限信息 (必需)
   * @apiSuccess {Object} data 更新结果
   */
  async updateUserPermission(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
      body: {
        permission: Joi.string().required(),
      },
    });
    const data = await this.service.users.updateUserPermission(ctx.params.uid, ctx.request.body);
    ctx.respond(data);
  }

  /**
   * @api {delete} /user/permission/:uid
   * @apiName deleteUserPermission
   * @apiDescription 删除用户权限
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteUserPermission(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserPermission(ctx.params.uid);
    ctx.respond(data);
  }

  /**
   * @api {get} /user/menu
   * @apiName getUserMenu
   * @apiDescription 获取当前用户菜单
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 用户菜单列表
   */
  async getUserMenu(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserMenu({
      uid,
    });
    ctx.respond(data);
  }

  /**
   * @api {put} /user/menu/:uid
   * @apiName updateUserMenu
   * @apiDescription 更新用户菜单
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiBody {String} menu 菜单信息 (必需)
   * @apiSuccess {Object} data 更新结果
   */
  async updateUserMenu(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
      body: {
        menu: Joi.string().required(),
      },
    });
    const data = await this.service.users.updateUserMenu(ctx.params.uid, ctx.request.body);
    ctx.respond(data);
  }

  /**
   * @api {delete} /user/menu/:uid
   * @apiName deleteUserMenu
   * @apiDescription 删除用户菜单
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteUserMenu(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserMenu(ctx.params.uid);
    ctx.respond(data);
  }

  /**
   * @api {get} /user/menu/tree
   * @apiName getUserMenuTree
   * @apiDescription 获取当前用户菜单树
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 用户菜单树
   */
  async getUserMenuTree(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserMenuTree({
      uid,
    });
    ctx.respond(data);
  }

  /**
   * @api {put} /user/menu/tree/:uid
   * @apiName updateUserMenuTree
   * @apiDescription 更新用户菜单树
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiBody {String} menu 菜单树信息 (必需)
   * @apiSuccess {Object} data 更新结果
   */
  async updateUserMenuTree(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
      body: {
        menu: Joi.string().required(),
      },
    });
    const data = await this.service.users.updateUserMenuTree(ctx.params.uid, ctx.request.body);
    ctx.respond(data);
  }

  /**
   * @api {delete} /user/menu/tree/:uid
   * @apiName deleteUserMenuTree
   * @apiDescription 删除用户菜单树
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiParam {String} uid 用户UID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteUserMenuTree(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserMenuTree(ctx.params.uid);
    ctx.respond(data);
  }

  /**
   * @api {get} /user/check
   * @apiName checkUser
   * @apiDescription 检查用户名是否存在
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiQuery {String} [username] 用户名
   * @apiSuccess {Boolean} data 是否存在（true=存在，false=不存在）
   * @apiSuccess {String} message 提示信息
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  { "status": 0, "data": true, "message": "存在用户" }
   * @apiSuccessExample {json} Error-Response:
   *  HTTP/1.1 200 OK
   *  { "status": 0, "data": false, "message": "不存在用户" }
   */
  async checkUser(ctx) {
    ctx.validateAsync({
      query: {
        username: Joi.string(),
      },
    });
    const username = ctx.query.username;
    const data = await this.service.users.findUser({
      username,
    }, ['username']); // 只返回用户名
    ctx.respond(data ? true : false, null, data ? '存在用户' : '不存在用户');
  }
}
