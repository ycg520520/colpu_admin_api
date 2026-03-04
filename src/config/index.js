/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-04 16:21:46
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { wechat, mysql, mysqlClients, redis, redisClients, aliOSS, aliScan } from "../../.config.js";
export default {
  port: 8610,
  domain: "http://localhost:8610",
  appConfig: {
    keys: ["colpu-session-secret-2025", "colpu-session-secret-2026"],
    proxy: true,
  },
  xss: null, // xss过滤中间件配置
  compress: null, // 压缩中间件配置
  cache: null, // 缓存中间件配置
  middlewares: ['error', 'state'
  ], // 需要使用的中间件及配置，需要对中间件加入配置参数使用对象模式「{ name: 'state', options: {} }」
  plugins: [], // 需要使用的插件(插件暂时为提供自动加载方式))
  proxy: null,
  session: {
    key: "koa:sess", // cookie的key。 (默认是 koa:sess)
    maxAge: 9e5, // session 过期时间，以毫秒ms为单位计算 。默认为15分钟
    autoCommit: true, // 自动提交到响应头。(默认是 true)
    overwrite: true, // 是否允许重写 。(默认是 true)
    httpOnly: true, // 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true)
    signed: true, // 是否签名。(默认是 true)
    rolling: true, // 是否每次响应时刷新Session的有效期。(默认是 false)
    renew: false, // 是否在Session快过期时刷新Session的有效期。(默认是 false)
    redis: {
      ...redis,
      database: 0,
    },
  },
  db: {
    redis: {
      clients: redisClients,
      default: redis,
    },
    mysql: {
      // 多库连接
      clients: mysqlClients,
      default: {
        ...mysql,
        dialect: "mysql",
        logging: console.log, // 是否开启日志
        pool: {
          max: 5, // 连接池最大保持连接数（process）
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          dateStrings: "TIMESTAMP",
          typeCast: true,
          multipleStatements: true,
        },
        timezone: "+08:00",
      },
    },
  },
  mixin: {
    aesKey: "colpuManagerAuth", // aesKey密钥必须16个字符
    salt: "oYHz2kn8y+ipyoUTtwdi3g==", // AES加密：{mode:'ECB', content: 'colpu', password:'ycg19800124',}
  },
  // 跨域配置
  cors: {
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
      'starttime',
      'endtime',
      "Access-Control-Allow-Origin"
    ],
  },
  schedule: {
    rule: '00 00 */8 * * *', // 每8小时执行一次
    // rule: '*/5 * * * * *', // 每5秒执行一次
    /**
     * rule 规则
     * *  *  *  *  *  *
     * ┬──┬──┬──┬──┬──┬
     * │  │  │  │  │  └ 天 dayOfWeek (0 - 7)(0 or 7 is Sun)
     * │  │  │  │  └───── 月 month(1 - 12)
     * │  │  │  └────────── 每月多少日 day of month(1 - 31)
     * │  │  └─────────────── 小时 hour(0 - 23)
     * │  └──────────────────── 分钟 minute(0 - 59)
     * └───────────────────────── 秒 second(0 - 59, OPTIONAL)
     * eg: *\/10 * * * * * 每10秒执行一次
     */
  },
  /**
   * AES解密相关
   *
   * aes_key: md5(32)=> foindia2023colpu
   * const AES_KEY = '30209b53f62320e54340ce19fd22b0d9';
   * aes_iv: md5(16)=> uploc3202aidniof
   * 将此数据混入数据中，分别插入到数据的从第一个字符开始分别插入，如果不够则不再插入
   * const AES_IV = '061f5be731462295';
   * const AES_DATA = 'foindia';
   */
  aes: {
    key: "30209b53f62320e54340ce19fd22b0d9",
    iv: "061f5be731462295",
    data: "foindia",
  },
  jwt: {
    secret_key: "QTF0woFCWEll8HerN0r3neLQKsE+qYm/",
  },
  ali: {
    // oss
    default: {
      ...aliOSS,
      arn: "acs:ram::1184036967255532:role/stsrole", // 自定义的权限策略名称
      customFolder: "",
      domain: "https://img.nadu8.com",
      policy: {
        Version: "1",
        Statement: [
          {
            Action: ['oss:PutObject', 'oss:GetObject'],
            Effect: 'Allow',
            // 这里$resource可以控制具体到哪个目录或者文件比如：
            // 1、具体目录colpu-file/*
            // 2、具体文件colpu-file/test/1.jpg
            Resource: ["acs:oss:*:*:$resource"],
          },
        ],
      },
    },
    // 鉴黄
    scan: {
      ...aliScan,
      endpoint: "imageaudit.cn-shanghai.aliyuncs.com",
    },
  },
  wx: {
    ...wechat,
    redirectUri: 'https://grumpy-items-poke.loca.lt/api/wechat/callback', // 回调地址
  },
};
