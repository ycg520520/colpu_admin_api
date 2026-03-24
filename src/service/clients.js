/**
 * @Author: colpu
 * @Date: 2025-09-17 16:27:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 10:23:51
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Service } from "@colpu/core";
import { Op } from "sequelize";
import { clients } from "../models/sys/index.js";
export default class ClientService extends Service {
  findOne(client_id) {
    return clients.findOne({
      attributes: ["client_id", "secret_key", "redirect_uris", "config", "scope"],
      where: {
        client_id,
        status: 1, // 状态，1-启用，0-禁用
      },
      raw: true,
    });
  }
}
