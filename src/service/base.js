/**
 * @Author: colpu
 * @Date: 2024-06-12 13:13:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-27 16:06:28
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Service } from "@colpu/core";
export default class Base extends Service {
  constructor(ctx) {
    super(ctx);
    this.utils = ctx.utils;
  }

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
