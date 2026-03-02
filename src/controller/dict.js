/**
 * @Author: colpu
 * @Date: 2025-11-03 14:25:18
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-03 23:19:57
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 字典管理控制器
 */
export default class DictController extends Controller {

  /**
   * @api {get} /dict/types
   * @apiName getDictTypes
   * @apiDescription 分页获取字典类型列表
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页字典类型列表
   */
  async getDictTypes(ctx) {
    const params = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.dict.getDictTypes(params);
    ctx.respond(data);
  };

  /**
   * @api {post} /dict/types
   * @apiName createDictType
   * @apiDescription 创建字典类型
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} name 字典类型名称 (必需)
   * @apiBody {String} type_code 字典类型编码 (必需)
   * @apiSuccess {Object} data 创建的字典类型信息
   */
  async createDictType(ctx) {
    ctx.validateAsync({
      body: {
        name: Joi.string().required(),
        type_code: Joi.string().required(),
      },
    });
    const body = ctx.request.body;
    const data = await this.service.dict.createDictType(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /dict/types
   * @apiName updateDictType
   * @apiDescription 更新字典类型
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 字典类型ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的字典类型信息
   */
  async updateDictType(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.dict.updateDictType(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /dict/types
   * @apiName deleteDictType
   * @apiDescription 删除字典类型
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 字典类型ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteDictType(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.dict.deleteDictType(ctx.query.id);
    ctx.respond(data, null, '删除成功');

  };

  /**
   * @api {get} /dict/data
   * @apiName getDictData
   * @apiDescription 根据类型ID获取字典数据
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 字典类型ID (必需)
   * @apiSuccess {Array} data 字典数据列表
   */
  async getDictData(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const { id } = ctx.query;
    const data = await this.service.dict.getDictDataByType(id);
    ctx.respond(data);
  };

  /**
   * @api {get} /dict/all
   * @apiName getAllDictData
   * @apiDescription 获取所有字典数据（按类型分组）
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiSuccess {Object} data 所有字典数据
   */
  async getAllDictData(ctx) {
    const data = await this.service.dict.getAllDictData();
    ctx.respond(data);
  };

  /**
   * @api {post} /dict/data
   * @apiName createDictData
   * @apiDescription 创建字典数据
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} label 字典标签 (必需)
   * @apiBody {String} value 字典值 (必需)
   * @apiBody {String} code 字典编码 (必需)
   * @apiBody {String} type_code 字典类型编码 (必需)
   * @apiSuccess {Object} data 创建的字典数据信息
   */
  async createDictData(ctx) {
    ctx.validateAsync({
      body: {
        label: Joi.string().required(),
        value: Joi.string().required(),
        code: Joi.string().required(),
        type_code: Joi.string().required(),
      },
    });
    const body = ctx.request.body;
    const data = await this.service.dict.createDictData(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /dict/data
   * @apiName updateDictData
   * @apiDescription 更新字典数据
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 字典数据ID (必需)
   * @apiBody {Object} [fields] 其他可扩展字段
   * @apiSuccess {Object} data 更新后的字典数据信息
   */
  async updateDictData(ctx) {
    ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });
    const body = ctx.request.body;
    const data = await this.service.dict.updateDictData(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /dict/data
   * @apiName deleteDictData
   * @apiDescription 删除字典数据
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 字典数据ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async deleteDictData(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.dict.deleteDictData(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

  /**
   * @api {get} /dict/types/check
   * @apiName checkDictType
   * @apiDescription 检查字典类型编码是否存在
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} type_code 字典类型编码 (必需)
   * @apiSuccess {Boolean} data 是否存在
   */
  async checkDictType(ctx) {
    ctx.validateAsync({
      query: {
        type_code: Joi.string().required(), // 字典类型
      },
    });
    const { type_code } = ctx.query;
    const res = await this.service.dict.checkDictType(type_code);
    ctx.respond(res, null, `${res ? '已存' : '不存'}在`);
  };

  /**
   * @api {get} /dict/data/check
   * @apiName checkDictData
   * @apiDescription 检查字典值或标签是否存在
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} type_code 字典类型编码 (必需)
   * @apiQuery {String} [value] 字典值
   * @apiQuery {String} [label] 字典标签
   * @apiSuccess {Boolean} data 是否存在
   */
  async checkDictData(ctx) {
    ctx.validateAsync({
      query: {
        type_code: Joi.string().required(), // 字典类型
        value: Joi.string(), // 字典值
        label: Joi.string(), // 字典标签
      },
    });
    const { value, label, type_code } = ctx.query;
    let data;
    let msg;
    if (value) {
      msg = '值'
      data = await this.service.dict.checkDictData(type_code, value, 'value');
    } else if (label) {
      msg = '标签'
      data = await this.service.dict.checkDictData(type_code, label, 'label');
    }
    ctx.respond(data, null, `${data ? '已存' : '不存'}在的${msg}`);
  };

  /**
   * @api {get} /dict
   * @apiName getDict
   * @apiDescription 获取字典（用于前端）
   * @apiGroup Dict
   * @apiVersion 1.0.0
   * @apiSuccess {Object} data 字典数据
   */
  async getDict(ctx) {
    const data = await this.service.dict.getDict();
    ctx.respond(data);
  }
}
