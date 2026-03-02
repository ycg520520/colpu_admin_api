/**
 * @Author: colpu
 * @Date: 2024-06-12 13:13:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-27 16:06:28
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Service } from "@colpu/core";

/**
 * 基础 Service 类，提供通用工具方法
 */
export default class Base extends Service {
  constructor(ctx) {
    super(ctx);
    this.utils = ctx.utils;
  }

  /**
   * 将参数对象转换为 SQL 占位符格式
   * @param {Object} params 参数对象，支持 as 前缀
   * @param {Number} [mode=0] 模式：0=INSERT 格式，1=WHERE 格式，2=UPDATE SET 格式
   * @returns {Object} { keys, values, replacements } 或 { values, replacements }
   */
  installParams(params, mode = 0) {
    const as = params.as ? `${params.as}.` : "";
    delete params.as;
    for (let key in params) {
      if (params[key] === undefined) {
        delete params[key];
      }
    }
    const keys = Object.keys(params).map((key) => `\`${key}\``);
    const replacements = Object.values(params);
    const values = "?".repeat(keys.length).split("");
    let returnData;
    switch (mode) {
      case 1:
        returnData = {
          values: `${as}${keys.join(`=? AND ${as}`)}${keys.length ? "=?" : ""}`,
          replacements,
        };
        break;
      case 2:
        returnData = {
          values: `${keys.join("=?, ")}${keys.length ? "=? " : ""}`,
          replacements,
        };
        break;

      default:
        returnData = {
          keys: keys.join(","),
          replacements,
          values: values.join(","),
        };
        break;
    }
    return returnData;
  }

  /**
   * 组合分页响应数据
   * @param {Object} data Sequelize findAndCountAll 结果 { rows, count }
   * @param {Number} page 当前页码
   * @param {Number} pageSize 每页条数
   * @returns {Object} { rows, total, page, pageSize, totalPages }
   */
  composePaginationData(data, page, pageSize) {
    const { rows, count: total = 0 } = data || {};
    return {
      ...data,
      rows,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    };
  }
}
