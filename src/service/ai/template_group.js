/**
 * @Author: colpu
 * @Date: 2026-06-09 15:08:48
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-09 16:39:08
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * 运营后台：AI 模版管理
 */
import Base from "../base.js";
import { Op, col } from "sequelize";
import {
  templateGroup,
} from "../../models/ai/index.js";
import { category } from "../../models/sys/index.js";

export default class TemplateGroupService extends Base {
  async all() {
    return templateGroup.findAll({
      where: { status: 1 },
      attributes: ["id", "name"],
      order: [
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
  }
  async create(data) {
    return templateGroup.create(data);
  }

  async update(data) {
    const { id, ...rest } = data;
    const row = await templateGroup.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`组ID：${id}不存在`), { status: 404 });
    }
    return row.update(rest);
  }

  async delete(id) {
    const row = await templateGroup.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`组ID：${id}不存在`), { status: 404 });
    }
    await row.update({ status: 0 });
    return true;
  }

  async findAll() {
    return templateGroup.findAll({
      where: { status: 1 },
      attributes: ["id", "name"],
      order: [
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
  }
}
