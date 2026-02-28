/**
 * @Author: colpu
 * @Date: 2025-12-15 16:23:55
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 16:23:55
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export const sleep = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
