/**
 * @Author: colpu
 * @Date: 2025-11-14 12:09:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:32:09
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 菜单管理控制器
 */
export default class MenusController extends Controller {
  /**
   * @api {get} /menus/tree
   * @apiName menusTree
   * @apiDescription 获取菜单树形结构
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 菜单树
   */
  async tree(ctx) {
    const data = await this.service.menus.tree();
    return ctx.respond(data);
  }

  /**
   * @api {get} /menus/all
   * @apiName menusAll
   * @apiDescription 获取所有菜单列表
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Object} query 查询参数
   * @apiSuccess {Array} data 菜单列表
   */
  async all(ctx) {
    const data = await this.service.menus.all(ctx.query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /routes
   * @apiName menusRoutes
   * @apiDescription 获取当前用户可访问的路由
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 路由列表
   */
  async routes(ctx) {
    const { id } = ctx.state.user
    const data = await this.service.menus.routes(id);
    return ctx.respond(data);
  }

  /**
   * @api {get} /menus
   * @apiName menusFindOne
   * @apiDescription 根据ID获取菜单详情
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 菜单ID (必需)
   * @apiSuccess {Object} data 菜单详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.menus.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /menus
   * @apiName menusCreate
   * @apiDescription 创建菜单
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} menu_type 菜单类型 (必需) [0=目录, 1=菜单, 2=按钮]
   * @apiBody {String} title 菜单标题 (必需)
   * @apiBody {String} [name] 路由名称 (menu_type 为 0 或 1 时必需)
   * @apiSuccess {Object} data 创建的菜单信息
   */
  async create(ctx) {
    const body = ctx.request.body;
    const validate = {
      menu_type: Joi.number().required(),
      title: Joi.string().required(),
    }
    if ([0, 1].includes(body.menu_type)) {
      Object.assign(validate, {
        name: Joi.string().required(),
      })
    }
    ctx.validateAsync({
      body: validate,
    });

    const data = await this.service.menus.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /menus
   * @apiName menusUpdate
   * @apiDescription 更新菜单
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 菜单ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的菜单信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.menus.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /menus
   * @apiName menusDelete
   * @apiDescription 删除菜单
   * @apiGroup Menus
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 菜单ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.menus.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
