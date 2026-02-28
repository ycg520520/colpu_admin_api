/**
 * @Author: colpu
 * @Date: 2025-12-10 17:25:08
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-19 16:18:28
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { logger } from "../models/sys/index.js";
import { Op } from "sequelize";
export default class LoggerService extends Base {
  list(params) {
    const { status, page = 1, pageSize = 20, name } = params;
    const where = {};
    if (status !== undefined) where.status = status;
    const orArr = []
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } })
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }
    return logger.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }
}
