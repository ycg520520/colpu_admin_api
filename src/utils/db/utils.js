/**
 * @Author: colpu
 * @Date: 2025-03-31 17:37:49
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-10 17:12:50
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
const utils = {
  /**
   * @function getClientConfig 得到client配置
   * @example  getClientConfig(db1) 则会将default和db1合并的配置结果
   * // 配置结构如下：
   * ``` json
   * {
   *  clients: {
   *    db1: {},
   *    db2: {}
   *  }
   *  default: {
   *    .....
   *  }
   * }
   * @param {String} clientName - 键值
   * @return {String} 配置结果
   * @api public
   */
  getClientConfig(config, clientName) {
    const clients = config.clients || Object.create(null);
    const defaultConfig = config.default || Object.create(null);

    const client = clients[clientName];
    if (!client) {
      return Object.assign(
        {
          database: clientName,
        },
        defaultConfig
      );
    }
    if (!client.database) {
      client.database = clientName;
    }

    // 合并默认配置
    return Object.assign({}, defaultConfig, client);
  },
};

export default utils;
