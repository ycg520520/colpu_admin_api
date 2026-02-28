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
export default class UserController extends Controller {
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

  async searchUserList(ctx) {
    const params = ctx.validateAsync({
      query: {
        keyword: Joi.string().required(),
      },
    });
    const data = await this.service.users.search(params, [['id', 'value'], ['nickname', 'label']]);
    ctx.respond(data);
  }

  async getUserList(ctx) {
    const params = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
        dept_id: Joi.number(),
      },
    });
    const data = await this.service.users.userList(params);
    ctx.respond(data);
  }

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

  async deleteUser(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.users.delete(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  }

  async updateUser(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.users.update(ctx.request.body);
    ctx.respond(data);
  }

  async getUserRole(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserRole({
      uid,
    });
    ctx.respond(data);
  }

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

  async deleteUserRole(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserRole(ctx.params.uid);
    ctx.respond(data);
  }
  async getUserPermission(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserRoleAndPermission({
      uid,
    });
    ctx.respond(data);
  }

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

  async deleteUserPermission(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserPermission(ctx.params.uid);
    ctx.respond(data);
  }

  async getUserMenu(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserMenu({
      uid,
    });
    ctx.respond(data);
  }

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
  async deleteUserMenu(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserMenu(ctx.params.uid);
    ctx.respond(data);
  }
  async getUserMenuTree(ctx) {
    const { uid } = ctx.state.user;
    const data = await this.service.users.findUserMenuTree({
      uid,
    });
    ctx.respond(data);
  }
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

  async deleteUserMenuTree(ctx) {
    ctx.validateAsync({
      params: {
        uid: Joi.string().required(),
      },
    });
    const data = await this.service.users.deleteUserMenuTree(ctx.params.uid);
    ctx.respond(data);
  }

  /* @api {get} /user/check
   * @apiName token
   * @apiDescription 检查用户是否存在
   * @apiGroup User
   * @apiVersion  1.0.0
   *
   * @apiQuery {String} username 用户名
   *
   * @apiSuccess {Boolean} status 请求是否成功
   * @apiSuccess {String} message 请求结果信息
   * Example {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *    "status": 1,
   *    "message": "存在用户"
   *  }
   * Example {json} Error-Response:
   *  HTTP/1.1 200 OK
   *  {
   *    "status": 0,
   *    "message": "不存在用户"
   *  }
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
