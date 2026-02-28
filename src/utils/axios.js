/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-03 15:46:13
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
/**
 * 请求处理
 */
import { stringify } from "querystring";
import axios from "axios";
import { Agent } from "http";
const env = process.env.NODE_ENV;
const $http = axios.create({
  timeout: 8000, // 请求超时时间
  headers: {
    "Accept-Encoding": "gzip",
  },
  httpAgent: new Agent({
    keepAlive: true,
  }),
});

function installUrl(url, params) {
  return `${url}${
    params && Object.keys(params).length
      ? `${url.indexOf("?") > -1 ? "&" : "?"}${stringify(params)}`
      : ""
  }`;
}

function consoleLog(type, tag, config, err) {
  const method = config.method.toLocaleUpperCase();
  console[type](
    `${tag} ${type.toLocaleUpperCase()}:: TIME:${
      Date.now() - config.startTime
    }ms, METHOD:${method}, URL:${installUrl(config.url, config.params)} ${
      method !== "GET" ? `, DATA:${stringify(config.data)}` : ""
    } ${err ? err.message : ""}`
  );
}

// 添加拦截器
$http.interceptors.request.use(
  (config) => {
    const method = config.method.toLocaleUpperCase();
    if (method === "GET") {
      delete config.data;
      config.params = Object.assign({}, config.params);
    } else {
      config.data = Object.assign({}, config.params, config.data);
      const contentType = config.headers["content-type"];
      if (
        contentType &&
        contentType.includes("application/x-www-form-urlencoded")
      ) {
        config.data = stringify(config.data);
      }
    }

    // 记录开始时间
    config.startTime = Date.now();
    if (env === "development") {
      consoleLog("log", "REQUEST", config);
    }
    return config;
  },
  (err) => {
    consoleLog("error", "REQUEST", err.config, err);
    return Promise.reject(err);
  }
);

$http.interceptors.response.use(
  (res) => {
    const config = res.config;
    if (env === "development") {
      consoleLog("log", "RESPONSE", res.config);
    }
    const resData = res.data;
    const { extra = {} } = config;
    if (extra.result && resData.status === 0) {
      return resData.data;
    }
    return resData;
  },
  (err) => {
    consoleLog("error", "RESPONSE", err.config, err);
    return Promise.reject(err);
  }
);

export default $http;
