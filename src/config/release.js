/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-03-29 22:47:00
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default {
  preview: "这是preview配置",
  db: {
    redis: null,
    mysql: {
      // 多库连接
      clients: {
        colpu: {
          password: "",
          host: "127.0.0.1",
          logging: false, // 是否开启日志
        },
      },
    },
  },
  deploy: {
    user: "root",
    host: ["127.0.0.1"],
    ref: "master",
  },
};
