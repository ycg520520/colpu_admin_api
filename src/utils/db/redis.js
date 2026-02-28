import utils from "./utils.js";
import Redis from "ioredis";
// import debugFactory from "debug";
// const debug = debugFactory("core:db/redis");

// 缓存redis数据库实例 instances
const redisInstances = {};

/**
 * @class RedisDB连接池封装
 */
class RedisDB {
  constructor(options) {
    if (!options) {
      throw new Error("不存在redis数据库配置！");
    }
    this._config = options;
    this._redisInstances = [];
    this.init();
  }
  get databases() {
    return this._redisInstances;
  }

  get config() {
    return this._config;
  }

  /**
   * @function init
   * @description 初始化创建数据库实例
   */
  init() {
    if (this.config.clients) {
      for (let k of Object.keys(this.config.clients)) {
        if (this.config.clients[k].host) {
          // 指名了redis host才默认初始化连接
          this._redisInstances.push(k);
        }
      }
    }
    this.databases.forEach((database) => {
      this.createClient(database);
    });
  }

  /**
   * @function createClient 创建redis客户端
   * @param {string} databasae
   */
  createClient(database) {
    let options = this._parseConfig(database);
    if (!options || !options.host) {
      console.error(
        "参数database不存在或者未指名数据库：%s",
        database,
        options
      );
      return;
    }

    const { cluster, nodes, port, db } = options;
    if (cluster === true && !nodes) {
      console.error("redis配置cluster为：%s，不存在 ", cluster, nodes);
      return;
    }

    let client = null;
    if (cluster === true) {
      // 兼容集群模式
      client = new Redis.Cluster(nodes, options);
      client.on("connect", function () {
        console.log("redis集群模式连接成功");
      });
      client.on("error", function (error) {
        console.error("redis连接失败 %o", error);
      });
    } else {
      // 创建redis实例
      client = new Redis(options);
      client.on("connect", function () {
        console.log("Redis连接成功 %s", `Port:${port}, DB:${db}`);
      });
      client.on("error", function (error) {
        console.error("Redis连接失败 %o", error);
      });
    }

    redisInstances[database] = client;
    return client;
  }

  /**
   * @example use('key')
   *    key 表示直接使用config key配置连接
   * @param {String} database 配置名称
   * @return {Redis} RedisClient redis实例
   *
   */
  use(database) {
    let db = redisInstances[database];
    if (!db) {
      // 不存在则动态redis连接
      db = this.createClient(database);
    }
    return db;
  }

  /**
   * 解析配置
   * @param {String} database
   */
  _parseConfig(database) {
    if (!database) {
      return null;
    }

    // db
    let db = database;
    let config = utils.getClientConfig(this.config, db);

    return config;
  }

  /**
   * @function closeAll 释放所有数据库连接池
   * @retrun {Promise} 返回关闭的数据库promise
   */
  closeAll() {
    let closeConns = [];
    for (let key in redisInstances) {
      redisInstances[key] = null;
    }
    return Promise.all(closeConns);
  }
}

export default RedisDB;
