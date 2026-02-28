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
export default class DictController extends Controller {

  // 获取字典类型列表
  async getDictTypes(ctx) {
    ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const params = ctx.query;
    const data = await this.service.dict.getDictTypes(params);
    ctx.respond(data);
  };

  // 创建字典类型
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

  // 更新字典数据
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

  async deleteDictType(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.dict.deleteDictType(ctx.query.id);
    ctx.respond(data, null, '删除成功');

  };

  // 根据类型获取字典数据
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

  // 获取所有字典数据
  async getAllDictData(ctx) {
    const data = await this.service.dict.getAllDictData();
    ctx.respond(data);
  };

  // 创建字典数据
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

  // 更新字典数据
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

  async deleteDictData(ctx) {
    ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.dict.deleteDictData(ctx.query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

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

  async getDict(ctx) {
    const data = await this.service.dict.getDict();
    ctx.respond(data);
  }
}
