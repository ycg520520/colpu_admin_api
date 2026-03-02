/**
 * @Author: colpu
 * @Date: 2025-11-20 15:09:29
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:28:06
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 部门管理控制器
 */
export default class DepartmentsController extends Controller {
  /**
   * @api {get} /department/tree
   * @apiName departmentTree
   * @apiDescription 获取部门树形结构
   * @apiGroup Department
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 部门树
   */
  async tree(ctx) {
    const data = await this.service.departments.tree();
    return ctx.respond(data);
  }

  /**
   * @api {get} /department/list
   * @apiName departmentList
   * @apiDescription 获取部门列表
   * @apiGroup Department
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Object} query 查询参数
   * @apiSuccess {Array} data 部门列表
   */
  async list(ctx) {
    // ctx.validateAsync({
    //   query: {
    //     page: Joi.number().default(1),
    //     pageSize: Joi.number().default(20),
    //   },
    // });
    const data = await this.service.departments.list(ctx.query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /department
   * @apiName departmentFindOne
   * @apiDescription 根据ID获取部门详情
   * @apiGroup Department
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 部门ID (必需)
   * @apiSuccess {Object} data 部门详情
   */
  async findOne(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.departments.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /department
   * @apiName departmentCreate
   * @apiDescription 创建部门
   * @apiGroup Department
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 部门名称 (必需)
   * @apiBody {Number} [parent_id] 父部门ID
   * @apiSuccess {Object} data 创建的部门信息
   */
  async create(ctx) {
    const body = ctx.request.body;
    ctx.validateAsync({
      body: {
        name: Joi.string().required(),
      },
    });

    const data = await this.service.departments.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /department
   * @apiName departmentUpdate
   * @apiDescription 更新部门
   * @apiGroup Department
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 部门ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的部门信息
   */
  async update(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.departments.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /department
   * @apiName departmentDelete
   * @apiDescription 删除部门
   * @apiGroup Department
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 部门ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.departments.delete(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
