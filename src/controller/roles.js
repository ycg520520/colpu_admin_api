/**
 * @Author: colpu
 * @Date: 2025-11-20 15:09:29
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-07 18:05:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 角色管理控制器
 */
export default class RoleController extends Controller {
  /**
   * @api {get} /role/list
   * @apiName roleList
   * @apiDescription 分页获取角色列表
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页角色列表
   */
  async roleList(ctx) {
    const param = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.roles.roleList(param);
    return ctx.respond(data);
  }

  /**
   * @api {get} /role/select
   * @apiName roleSelect
   * @apiDescription 获取角色下拉选项
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 角色选项 [{id, value}, {name, label}]
   */
  async roleSelect(ctx) {
    const data = await this.service.roles.roleAll([['id', 'value'], ['name', 'label']]);
    return     ctx.respond(data);
  }

  /**
   * @api {get} /role
   * @apiName getRole
   * @apiDescription 根据ID获取角色详情
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 角色ID (必需)
   * @apiSuccess {Object} data 角色详情
   */
  async getRole(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.roles.getRole(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /role
   * @apiName createRole
   * @apiDescription 创建角色
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 角色名称 (必需)
   * @apiBody {String} code 角色编码 (必需)
   * @apiSuccess {Object} data 创建的角色信息
   */
  async createRole(ctx) {
    const body = ctx.validateAsync({
      body: {
        name: Joi.string().required(),
        code: Joi.string().required(),
      },
    });

    const data = await this.service.roles.createRole(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /role
   * @apiName updateRole
   * @apiDescription 更新角色
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 角色ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的角色信息
   */
  async updateRole(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.roles.updateRole(body);
    ctx.respond(data, null, '更新成功');
  };

  /**
   * @api {delete} /role
   * @apiName deleteRole
   * @apiDescription 删除角色
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 角色ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteRole(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.roles.deleteRole(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

  /**
   * @api {get} /role/user
   * @apiName getRoleUser
   * @apiDescription 获取角色下的用户列表
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} role_id 角色ID (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 用户列表
   */
  async getRoleUser(ctx) {
    const params = ctx.validateAsync(ctx.utils.schemaPagination({ role_id: Joi.number().required() }));
    const data = await this.service.roles.getRoleUser(params);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {post} /role/user
   * @apiName createRoleUser
   * @apiDescription 为角色添加用户
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} role_id 角色ID (必需)
   * @apiBody {Array} user_ids 用户ID数组 (必需)
   * @apiSuccess {Object} data 操作结果
   */
  async createRoleUser(ctx) {
    ctx.validateAsync({
      body: {
        role_id: Joi.number().required(),
        user_ids: Joi.array().items(Joi.string()).required()
      },
    });
    const data = await this.service.roles.createRoleUser(ctx.request.body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {delete} /role/user
   * @apiName deleteRoleUser
   * @apiDescription 从角色中移除用户
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} role_id 角色ID (必需)
   * @apiQuery {Array|String} user_ids 用户ID数组或逗号分隔字符串 (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteRoleUser(ctx) {
    const params = ctx.validateAsync({
      query: {
        role_id: Joi.number().required(),
        user_ids: Joi.alternatives().try(
          Joi.array().items(Joi.string()),
          Joi.string().pattern(/^\d+(,\d+)*$/),
        ).required()
      },
    });
    const data = await this.service.roles.deleteRoleUser(params);
    ctx.respond(data, null, '删除成功');
  }

  /**
   * @api {post} /role/permission
   * @apiName rolePermission
   * @apiDescription 为角色分配权限
   * @apiGroup Role
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} role_id 角色ID (必需)
   * @apiBody {Array} perm_ids 权限ID数组 (必需)
   * @apiSuccess {Object} data 分配结果
   */
  async rolePermission(ctx) {
    const body = ctx.validateAsync({
      body: {
        role_id: Joi.number().required(),
        perm_ids: Joi.array().items(Joi.number()).required()
      },
    });
    const data = await this.service.roles.rolePermission(body);
    ctx.respond(data);
  }
}
