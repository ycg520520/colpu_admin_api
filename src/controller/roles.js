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

export default class RoleController extends Controller {
  async roleList(ctx) {
    const param = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.roles.roleList(param);
    return ctx.respond(data);
  }

  async roleSelect(ctx) {
    const data = await this.service.roles.roleAll([['id', 'value'], ['name', 'label']]);
    return ctx.respond(data);
  }

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

  async deleteRole(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.roles.deleteRole(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

  async getRoleUser(ctx) {
    const params = ctx.validateAsync({
      query: {
        role_id: Joi.number().required(),
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.roles.getRoleUser(params);
    ctx.respond(data, null, '创建成功');
  };

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
