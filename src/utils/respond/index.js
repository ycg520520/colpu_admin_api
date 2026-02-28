/**
 * @Author: colpu
 * @Date: 2024-06-12 09:50:31
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-19 12:41:38
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import _ from "lodash";
import statuses from "statuses";
import userCodes from "./codes.js";
import cryptoUtils from "../crypto.js";

// 状态码不在系统状态内，且大于999小余100，认为是需要返回正确的状态数据给用户
const codes = _.merge(statuses, userCodes);

export default function respondPlugin(app) {
  /**
   * @function status 根据code取状态码对应的message
   * @param {Number} code
   */
  function statusInfo(code) {
    return codes[code];
  };

  /**
   * @function respond 统一响应体
   * @param {Object} data
   * @param {String} message
   * @param {Number} status
   */
  function respond(data, status, message, isDecrypt) {
    data = data || undefined; // 解决data为null或者undefined
    status = status || 0; // 解决status为null或者undefined
    message = message || statusInfo(status) || "未知错误";
    return {
      data,
      status,
      message,
      isDecrypt
    };
  }

  function respondBody(data, status, message) {
    const ctx = this;
    ctx.body = respond(data, status, message);
  }

  function respondEncrypt(data, status, message) {
    const ctx = this;
    const {
      config,
      app: { env },
    } = ctx;
    if (env === "development") {
      ctx.body = respond(data, status, message);;
    } else {
      const aesData = typeof data === "object" ? JSON.stringify(data) : data;
      const strData = cryptoUtils.encryptAesMix(aesData, config.aes);
      ctx.body = respond(strData, status, message, true);
    };
  }
  app.context.respondStatus = statusInfo;
  app.context.respond = respondBody;
  app.context.respondEncrypt = respondEncrypt
}
