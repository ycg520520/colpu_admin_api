/**
 * @Author: colpu
 * @Date: 2025-11-30 18:02:30
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:36:43
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 权限管理控制器
 */
export default class PermissionController extends Controller {
  /**
   * @api {get} /permission/list
   * @apiName permissionList
   * @apiDescription 分页获取权限列表
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页权限列表
   */
  async list(ctx) {
    const params = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.permission.list(params);
    return ctx.respond(data);
  }

  /**
   * @api {get} /permission
   * @apiName permissionFindOne
   * @apiDescription 根据ID获取权限详情
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 权限ID (必需)
   * @apiSuccess {Object} data 权限详情
   */
  async findOne(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.permission.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {get} /permission/tree
   * @apiName permissionTree
   * @apiDescription 获取权限树形结构
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 权限树
   */
  async tree(ctx) {
    const data = await this.service.permission.tree();
    ctx.respond(data);
  };

  /**
   * @api {post} /permission/give
   * @apiName permissionGive
   * @apiDescription 为角色分配权限
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} role_id 角色ID (必需)
   * @apiBody {Array} perm_ids 权限ID数组 (必需)
   * @apiSuccess {Object} data 分配结果
   */
  async give(ctx) {
    const body = ctx.validateAsync({
      body: {
        role_id: Joi.number().required(),
        perm_ids: Joi.array().items(Joi.number()).required()
      },
    });
    const data = await this.service.permission.give(body);
    ctx.respond(data);
  };

  /**
   * @api {post} /permission
   * @apiName permissionCreate
   * @apiDescription 创建权限
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 权限名称 (必需)
   * @apiBody {String} [perm_code] 权限编码
   * @apiBody {String} [type] 权限类型
   * @apiSuccess {Object} data 创建的权限信息
   */
  async create(ctx) {
    const body = ctx.request.body;
    ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.permission.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /permission
   * @apiName permissionUpdate
   * @apiDescription 更新权限
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 权限ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的权限信息
   */
  async update(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.permission.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /permission
   * @apiName permissionDelete
   * @apiDescription 删除权限
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 权限ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.permission.delete(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

  /**
   * @api {get} /permission/users
   * @apiName permUsers
   * @apiDescription 获取拥有指定权限的用户列表
   * @apiGroup Permission
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} perm_id 权限ID (必需)
   * @apiSuccess {Array} data 用户列表
   */
  async permUsers(ctx) {
    const { perm_id } = ctx.validateAsync({
      query: {
        perm_id: Joi.number().required(),
      },
    });
    const data = await this.service.permission.permUsers(perm_id);
    ctx.respond(data);
  }
}
