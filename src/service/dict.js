/**
 * @Author: colpu
 * @Date: 2025-11-03 11:59:33
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-03 23:20:23
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { dictData, dictTypes } from "../models/sys/index.js";
import { Op } from "sequelize";
export default class DictService extends Base {
  constructor(ctx) {
    super(ctx);
    this.dictTypes = dictTypes;
    this.dictData = dictData;
    this.cache = new Map(); // 缓存字典数据
  }

  // 获取所有字典类型
  async getDictTypes(params = {}) {
    const { status, page = 1, pageSize = 20, type_code, name } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (type_code) {
      orArr.push({ type_code: { [Op.like]: `%${type_code}%` } })
    }
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }

    return this.dictTypes.findAndCountAll({
      where,
      order: [['sort_order', 'ASC'], ['id', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      attributes: {}
    }).then(res => this.composePaginationData(res, page, pageSize))

  }

  // 根据类型编码获取字典数据
  async getDictDataByType(id) {
    const dictType = await this.dictTypes.findOne({
      where: { id, status: 1 }
    });
    if (!dictType) {
      throw new Error(`字典类型 ${id} 不存在或已禁用`);
    }
    const { name, type_code } = dictType;
    const dictData = await this.dictData.findAll({
      where: {
        type_code,
        status: 1
      },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });
    const result = {
      type_code,
      name,
      rows: dictData
    };
    return result;
  }

  // 批量获取多个字典类型的数据
  async getMultipleDictData(typeCodes, useCache = true) {
    const result = {};
    for (const typeCode of typeCodes) {
      try {
        result[typeCode] = await this.getDictDataByType(typeCode, useCache);
      } catch (error) {
        console.warn(`获取字典 ${typeCode} 失败:`, error.message);
        result[typeCode] = undefined;
      }
    }

    return result;
  }

  // 获取所有字典数据（用于前端初始化）
  async getAllDictData() {
    const dictTypes = await this.dictTypes.findAll({
      where: { status: 1 },
      attributes: ['type_code', 'name']
    });

    const result = {};
    for (const type of dictTypes) {
      const dictData = await this.dictData.findAll({
        where: {
          type_code: type.type_code,
          status: 1
        },
        order: [['sort_order', 'ASC']],
        attributes: ['code', 'value', 'label', 'css_class', 'is_default', 'remark']
      });

      result[type.type_code] = {
        name: type.name,
        data: dictData.reduce((acc, item) => {
          acc[item.code] = {
            value: item.value,
            label: item.label,
            css_class: item.css_class,
            is_default: item.is_default
          };
          return acc;
        }, {})
      };
    }
    return result;
  }

  // 创建字典类型
  async createDictType(data) {
    const existing = await this.dictTypes.findOne({
      where: { type_code: data.type_code }
    });

    if (existing) {
      throw new Error(`字典类型编码 ${data.type_code} 已存在`);
    }
    return this.dictTypes.create(data);
  }

  // 更新字典类型
  async updateDictType(data) {
    const id = data.id;
    delete data.id;
    const dictType = await this.dictTypes.findByPk(id);

    if (!dictType) {
      throw new Error(`字典类型 ID ${id} 不存在`);
    }

    return dictType.update(data);
  }
  // 删除字典数据
  async deleteDictType(id) {
    const dictType = await this.dictTypes.findByPk(id);

    if (!dictType) {
      throw new Error(`字典数据 ID ${id} 不存在`);
    }

    await dictType.destroy();

    return true;
  }

  // 创建字典数据
  async createDictData(data) {
    const dictType = await this.dictTypes.findOne({
      where: { type_code: data.type_code, status: 1 }
    });

    if (!dictType) {
      throw new Error(`字典类型 ${data.type_code} 不存在或已禁用`);
    }

    const existing = await this.dictData.findOne({
      where: {
        type_code: data.type_code,
        code: data.code
      }
    });

    if (existing) {
      throw new Error(`字典数据编码 ${data.code} 已存在`);
    }

    return this.dictData.create(data);
  }

  // 更新字典数据
  async updateDictData(data) {
    const id = data.id;
    delete data.id;
    const dictData = await this.dictData.findByPk(id);

    if (!dictData) {
      throw new Error(`字典数据 ID ${id} 不存在`);
    }

    return dictData.update(data);
  }

  // 删除字典数据
  async deleteDictData(id) {
    const dictData = await this.dictData.findByPk(id);

    if (!dictData) {
      throw new Error(`字典数据 ID ${id} 不存在`);
    }

    await dictData.destroy();

    return true;
  }

  // 根据字典值和类型获取标签
  async getLabelByValue(typeCode, code) {
    try {
      const dictData = await this.getDictDataByType(typeCode);
      const item = dictData.data.find(item => item.code === code);
      return item ? item.label : code;
    } catch (error) {
      return code;
    }
  }

  // 根据标签获取字典值
  async getValueByLabel(typeCode, label) {
    try {
      const dictData = await this.getDictDataByType(typeCode);
      const item = dictData.data.find(item => item.label === label);
      return item ? item.value : undefined;
    } catch (error) {
      return undefined;
    }
  }
  // 验证标签是否存在于字典中
  async checkDictData(type_code, value, key = 'label') {
    try {
      const dictData = await this.dictData.findAll({
        where: {
          type_code
        },
        attributes: [key]
      });
      const item = dictData.find(item => item[key] == value);
      return item ? true : false;
    } catch (error) {
      return false;
    }
  }
  async checkDictType(type_code) {
    try {
      const res = await this.dictTypes.findOne({
        where: {
          type_code
        },
      });
      return res ? true : false;
    } catch (error) {
      return false;
    }
  }

  async getDict() {
    return this.dictTypes.findAll({
      where: { status: 1 },
      attributes: ['type_code', 'name', 'remark'],
      include: [{
        model: dictData,
        where: { status: 1 },
        attributes: ['code', 'value', 'label', 'is_default']
      }]
    })
      .then(res => {
        const result = {};
        res.forEach(item => {
          const { type_code, DictData, ...rest } = item.dataValues;
          const defaultItem = DictData.find(item => item.is_default === 1) || {};
          // 这里的DictData是模型dictData的别名
          result[type_code] = {
            ...rest,
            defaultValue: defaultItem.value,
            defaultCode: defaultItem.code,
            options: DictData
          };
        })
        return result;
      })
  }
}
