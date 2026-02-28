import utils from "./utils.js";
import Sequelize from "sequelize";

// const debug = require('debug')('core:db/database');

// 缓存数据库实例 instances
const cachedInstances = {};

/**
 * @class DataBase
 * 数据库连接池封装，基于sequelize
 * @constructor
 * @param {String} dbType  mysql|mssql
 * @param {Object} options options配置内容
 */
class DataBase {
  constructor(dbType, options) {
    if (!options) {
      throw new Error(`不存在数据库配置：${dbType}的配置！`);
    }
    this._config = options;
    this.dbType = dbType;
    cachedInstances[dbType] = {};
    this._init();
  }

  get config() {
    return this._config;
  }

  /**
   * @function init
   * @description 初始化创建数据库实例
   */
  async _init() {
    if (this.config.clients) {
      for (let k of Object.keys(this.config.clients)) {
        const config = this._parseConfig(k);
        if (config.database && config.init_connect) {
          // 指明了database才默认初始化连接
          this.createClient(config);
        }
      }
    }
  }

  /**
   * @function createClient 创建Db Client
   * @param {Object} options
   */
  createClient(options) {
    const { database, user, password } = options;
    const sequelize = new Sequelize(database, user, password, options);
    cachedInstances[this.dbType][database] = sequelize;
    return sequelize;
  }

  async initDatabase(dbkey, force) {
    const options = this._parseConfig(dbkey);
    if (await this.createDatabaseIfNotExists(options)) {
      let sequelize = cachedInstances[this.dbType][dbkey];
      if (!sequelize) {
        sequelize = this.createClient(options);
      }
      const { database, host } = options;
      // 测试连接
      await sequelize.authenticate().then(() => {
        console.log("数据库：%s 已经连接成功~", database);
        // 同步数据
        return this.syncModels(sequelize, host, force);
      })
    }
  }

  /**
   * @example use('key')、use('key.database')
   *    key 表示直接使用config key配置连接
   *    key.database 表示使用key配置+database数据库连接
   * @param {String} database 数据库名称
   * @return {Object} Sequelize db 连接
   *
   */
  use(dbkey) {
    let sequelize = cachedInstances[this.dbType][dbkey];
    const options = this._parseConfig(dbkey);
    if (!sequelize) {
      sequelize = this.createClient(options);
    }
    return sequelize;
  }

  /**
   * @function _parseConfig 解析配置
   * @param {String} database
   */
  _parseConfig(database) {

    if (!database) {
      throw new Error(`必须指定参数database`);
    }

    // db
    let db = database,
      dbName = null;

    // support (instance.name) or (instance)
    if (database.indexOf(".") !== -1) {
      let arrs = database.split(".");
      db = arrs[0];
      dbName = arrs[1];
    }

    let config = utils.getClientConfig(this.config, db);
    if (dbName) {
      config.database = dbName; // 此情况说明指名了instance.database
    }
    if (!config || !config.database) {
      const msg = `参数database不存在或者未指名数据库：${database}`;
      console.error(`${msg} %o`, options);
      throw new Error(msg);
    }
    return config;
  }

  /**
   * @function closeAll 释放所有数据库连接池
   * @retrun {Promise} 返回关闭的数据库promise
   */
  closeAll() {
    let closeConns = [];
    for (let key in cachedInstances[this.dbType]) {
      closeConns.push(cachedInstances[this.dbType][key].close());
      cachedInstances[this.dbType][key] = null;
    }
    return Promise.all(closeConns);
  }

  createDatabaseIfNotExists(options) {
    const { database, user, password, host, dialect = 'mysql' } = options;
    const tempSequelize = new Sequelize(dialect, user, password, {
      host,
      dialect,
      logging: false,
    });

    // 检查数据库是否存在
    return tempSequelize
      .query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${database}'`
      )
      .then(([results]) => {
        if (results.length === 0) {
          console.log("数据库不存在，正在创建...");
          return tempSequelize
            .query(
              `CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
            )
            .then(async () => {
              console.log("数据库创建成功!");
              return true;
            });
        } else {
          console.log("数据库已存在");
          return true;
        }
      })
      .catch((err) => {
        console.error("创建数据库失败:", err);
        return Promise.reject(err);
      }).finally(() => {
        tempSequelize.close();
      });
  }
  // 同步模型（创建表）
  syncModels(sequelize, host = "127.0.0.1", force = true) {
    return sequelize
      .sync({
        force, // 强制重建表
        alter: process.env.NODE_ENV === "development" && host === "127.0.0.1", // 开发环境自动修改表结构
      })
      .then((res) => {
        console.log(`在服务器:${host}, 所有模型同步成功~`,);
        return res
      })
      .catch((err) => {
        console.error(`在服务器:${host}, 同步模型失败:`, err);
        Promise.reject(err);
      });
  }
}

export default DataBase;
