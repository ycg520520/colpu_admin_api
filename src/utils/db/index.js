/**
 * @Author: colpu
 * @Date: 2025-09-18 08:49:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-29 13:55:42
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Database from "./database.js";
import Redis from "./redis.js";
import coreConf from "../../config/index.js";
import _ from "lodash";
const env = process.env.NODE_ENV || "development";
const config = _.merge(
  {},
  coreConf,
  (await import(`../../config/${env}.js`))
);
const DbInstances = Object.create(null);
// 开启对应的基础
if (config.db) {
  const dbConf = config.db;
  const types = Object.keys(dbConf);
  for (let i = 0, len = types.length; i < len; i++) {
    const item = types[i];
    const options = dbConf[item];
    if (options) {
      let db;
      if (item === "redis") {
        db = new Redis(options);
      } else {
        db = new Database(item, options);
      }
      DbInstances[item] = db;
    }
  }
}

export default DbInstances;
