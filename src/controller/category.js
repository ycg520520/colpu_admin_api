/**
 * @Author: colpu
 * @Date: 2026-05-19 00:25:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-10 13:58:56
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 角色管理控制器
 */
export default class CategoryController extends Controller {
  /**
   * @api {get} /category/tree
   * @apiName categoryTree
   * @apiDescription 获取分类树形结构
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 菜单树
   */
  async tree(ctx) {
    const data = await this.service.category.tree(ctx.query);
    return ctx.respond(data);
  }
  /**
   * @api {get} /category/all
   * @apiName all
   * @apiDescription 分页获取所有分类列表
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Object} data 所有分类列表
   */
  async all(ctx) {
    const data = await this.service.category.all(ctx.query);
    return ctx.respond(data);
  }
  /**
   * @api {get} /category/list
   * @apiName list
   * @apiDescription 分页获取分类列表
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页角色列表
   */
  async list(ctx) {
    const param = ctx.validate(ctx.utils.schemaPagination());
    const data = await this.service.category.list(param);
    return ctx.respond(data);
  }

  /**
   * @api {get} /category
   * @apiName findOne
   * @apiDescription 根据ID获取分类详情
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 分类ID (必需)
   * @apiSuccess {Object} data 分类详情
   */
  async findOne(ctx) {
    ctx.validate({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.category.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /category
   * @apiName create
   * @apiDescription 创建分类
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 分类名称 (必需)
   * @apiBody {String} code 分类编码 (必需)
   * @apiSuccess {Object} data 创建的分类信息
   */
  async create(ctx) {
    const body = ctx.validate({
      body: {
        name: Joi.string().required(),
        code: Joi.string().required(),
      },
    });

    const data = await this.service.category.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /category
   * @apiName update
   * @apiDescription 更新分类
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 分类ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的分类信息
   */
  async update(ctx) {
    ctx.validate({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.category.update(body);
    ctx.respond(data, null, '更新成功');
  };

  /**
   * @api {delete} /category
   * @apiName delete
   * @apiDescription 删除分类
   * @apiGroup Category
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 分类ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    ctx.validate({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.category.delete(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };
}
