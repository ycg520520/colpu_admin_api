/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-03-29 22:46:54
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default {
  minifier: true,
  db: {
    redis: null,
    mysql: null,
  },
  deploy: {
    user: "root",
    host: ["127.0.0.1"],
    ref: "master",
  },
};
