/**
 * @Author: colpu
 * @Date: 2025-09-17 16:27:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-17 15:25:34
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Service } from "@colpu/core";
import { Op } from "sequelize";
import { clients } from "../models/sys/index.js";
export default class ClientService extends Service {
  findOne(client_id) {
    return clients.findOne({
      attributes: ["client_id", "secret_key", "redirect_uris", "status"],
      where: {
        client_id,
        status: {
          [Op.ne]: 1, // 状态，1表示禁用，0表示启用
        },
      },
      raw: true,
    });
  }
}
