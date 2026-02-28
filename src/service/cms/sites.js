/**
 * @Author: colpu
 * @Date: 2026-01-07 16:16:45
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-15 17:26:12
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Base from "../base.js";
import { sites } from "../../models/cms/index.js";
export default class SitesService extends Base {
  find() {
    return sites.findAll({
      raw: true,
    }).then((res) => res[0]);
  }
  async create(data) {
    return sites.create(data);
  }
  async update(data) {
    const { id, ...rest } = data;
    const res = await sites.findByPk(id);
    if (!res) {
      throw new Error(`站点设置ID：${id}不存在`);
    }
    return res.update(rest);
  }
}
