/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-19 12:11:22
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default {
  wx: {
    redirectUri: 'https://api-indian.nadu8.com/api/wechat/callback', // 回调地址
  },
  minifier: true,
  deploy: {
    user: "root",
    host: ["121.40.68.151"],
    ref: "origin/master",
  },
};
