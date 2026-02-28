/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-18 23:33:47
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import DbInstances from "../utils/db/index.js";
export default (app) => {
  const types = Object.keys(DbInstances);
  for (let i = 0, len = types.length; i < len; i++) {
    const key = types[i];
    app[key] = DbInstances[key];
  }
};
