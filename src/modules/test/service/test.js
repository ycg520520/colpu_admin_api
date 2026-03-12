/**
 * @Author: colpu
 * @Date: 2025-12-15 21:14:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-08 22:28:53
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { Service } from "@colpu/core";
export default class TestService extends Service {
  async find(query) {
    return {
      message: '这是一个测试服务',
      ...query};
  }
}
