/**
 * @Author: colpu
 * @Date: 2022-11-25 10:53:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-18 23:29:48
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import debugFactory from "debug";
import session from "koa-session";
import Redis from "./db/redis.js";
const debug = debugFactory("koa-session:context");
class ContextStore {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig).use(0);
  }

  async get(key, maxAge, options) {
    debug("获取session key:%s, maxAge:%i options:%o", key, maxAge, options);
    let data = await this.redis.get(`SESSION:${key}`);
    return JSON.parse(data);
  }

  async set(key, data, maxAge, options) {
    debug(
      "设置session key:%s, data:%o, maxAge:%i, options:%o",
      key,
      data,
      maxAge,
      options
    );
    try {
      await this.redis.set(
        `SESSION:${key}`,
        JSON.stringify(data),
        "PX",
        maxAge
      );
    } catch (e) { }
    return key;
  }

  async destroy(key, options) {
    debug("destroy session key:%s, options:%o", key, options);
    return await this.redis.del(`SESSION:${key}`);
  }
}
export default (app, config) => {
  const sessionRedisConf = config.redis;
  if (sessionRedisConf) {
    delete config.redis;
    config.store = new ContextStore({ clients: { 0: sessionRedisConf } });
  }
  return session(app, config);
};
