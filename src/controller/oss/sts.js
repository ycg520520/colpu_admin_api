import OSS from "ali-oss";
import Joi from "joi";
import { join, extname as _extname } from "path";
import moment from "moment";
import cryptoUtil from "../../utils/crypto.js";
import { Controller } from "@colpu/core"
const { STS } = OSS;
export default class AliSTS extends Controller {
  /**
   * @api {get} /api/sts 获取阿里STS授权
   * @apiGroup  阿里OSS
   * @apiVersion 1.0.0
   *
   * @apiParam {String} [filename] 文件名称（可带路径）
   * @apiParam {String} [type] 授权类型，即RAM访问控制用户RAM 角色名称
   * @apiParam {Boolean} [rename] 是否重命名，重命名方式为MD5(uuid + filename)
   * @apiParam {String} [folder] 指定上传到目录
   * @apiParam {Boolean} [hastime] 是否有时间目录，默认有
   *
   * @apiSuccess {Number} status 状态码
   * @apiSuccess {String} message 消息
   * @apiSuccess {Object} data 返回数据
   * @apiSuccess {String} data.bucket bucket名称
   * @apiSuccess {String} data.region 来自账户bukect对应的region以杭州为例（oss-cn-hangzhou）
   * @apiSuccess {String} data.endpoint 来自账户bukect对应的 endpoint of upload sts
   * @apiSuccess {String} data.filepath 用户传filename文件名称（可带路径），通过转换后输出给授权路径filepath，这里可以做对应的操作，比如对用户做特定目录指定
   * @apiSuccess {String} data.domain 域名 授权域名
   * @apiSuccess {String} data.viewUrl 预览连接地址
   * @apiSuccess {Object} data.token 上传token
   * @apiSuccess {String} data.token.accessKeyId 来源与STS令牌 AccessKeyId
   * @apiSuccess {String} data.token.accessKeySecret 来源与STS令牌 AccessKeySecret
   * @apiSuccess {String} data.token.expiration 来源与STS令牌 Expiration
   * @apiSuccess {String} data.token.securityToken 来源与STS令牌 SecurityToken
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "data": {
   *       "bucket": "colpu-file",
   *       "region": "oss-cn-hangzhou",
   *       "endpoint": "oss-cn-hangzhou.aliyuncs.com",
   *       "filePath": "spss/2.jpg",
   *       "domain": "//test.domian.com",
   *       "viewUrl": "//test.domian.com/spss/2.jpg",
   *       "token": {
   *           "securityToken": "CAISmQJ1q6Ft5B2yfSjIr5fkOonct7gT9Je...",
   *           "accessKeyId": "STS.NTQq3hZg2CUTSbmoeTqp3H85k",
   *           "accessKeySecret": "86fdeS8jw9cvDN2Xq6oHTMmPLUGNNse74p3R3xMdsDde",
   *           "expiration": "2020-05-19T10:51:20Z"
   *       }
   *   },
   *   "status": 0,
   *   "message": " ok"
   * }
   */
  async assumeRole(ctx) {
    // 参数验证
    ctx.validateAsync({
      query: {
        bucket: Joi.string().allow(null, ""),
        type: Joi.string().allow(null, ""),
        filename: Joi.string().allow(null, ""),
        rename: Joi.boolean(),
        folder: Joi.string().allow(null, ""),
        hastime: Joi.boolean(),
      },
      status: 10001,
    });

    let {
      bucket: aliossType = "default",
      type = "file",
      filename,
      rename = false,
      folder = "",
      hastime = false,
    } = ctx.query;
    // 获取配置
    const { ali } = this.config;
    const ossConfig = ali[aliossType];
    if (!ossConfig) {
      return ctx.respond(null, 1, "服务端未找到配置");
    }
    const stsInstance = new STS({
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
    });
    let { policy, bucket } = ossConfig;

    const filepath = this._getFilePath(
      folder || ossConfig.customFolder,
      hastime
    );
    // endpoint: "oss-cn-beijing.aliyuncs.com",
    filename = this._getPathFileName(
      type === "file" ? filepath : "",
      filename,
      rename
    );
    // 替换为授权到文件
    policy = JSON.stringify(policy).replaceAll(
      "$resource",
      `${bucket}/${type === "file" && filename ? filename : filepath ? `${filepath}/*` : '*'}`
    );
    console.log('policy==>', policy)
    policy = JSON.parse(policy);
    try {
      const token = await stsInstance.assumeRole(
        ossConfig.arn,
        policy,
        // 设置临时访问凭证的有效时长，单位为s，最小有效时长为900s，最大有效时长为3600s。
        ossConfig.expiration || 15 * 60,
        ossConfig.session
      );
      const res = this._getResult(
        type === "file" ? "" : filepath,
        filename,
        token,
        ossConfig
      );
      ctx.respond(res);

      // 以下是测试收取读取数据
      // const ossClient = new OSS({
      //   stsToken: token.credentials.SecurityToken,
      //   accessKeyId: token.credentials.AccessKeyId,
      //   accessKeySecret: token.credentials.AccessKeySecret,
      //   bucket: ossConfig.bucket
      // })
      // const res = await ossClient.getFile(filename);
      // this.ctx.set('content-type', res.headers['content-type']); //设置返回类型
      // this.ctx.body = res.data;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @function 获取到授权文件
   * @param {String} filename
   * @param {Object} ossConfig
   * @returns
   */
  _getFilePath(customFolder, hastime = true) {
    // 按照时间做目录
    const filepath = join(customFolder, hastime ? moment().format("YYYY_MM") : "");
    if (filepath === '.') {
      return ''
    }
    return filepath;
  }
  _getPathFileName(filepath, filename, rename) {
    if (!filename) {
      return "";
    }
    const extname = _extname(filename);
    return join(
      filepath,
      rename ? cryptoUtil.md5(cryptoUtil.uuid() + filename) + extname : filename
    );
  }

  _getDomain(ossConfig) {
    let { domain, region } = ossConfig;
    if (!domain) {
      // 外网不能带有-internal
      region = region.replace("-internal", "");
      domain = `https://${bucket}.${region}.aliyuncs.com`;

    }
    return domain;
  }
  _getResult(filepath, filename, token, ossConfig) {
    let { bucket, region } = ossConfig;
    const domain = this._getDomain(ossConfig);
    const url = domain  + (!!filename ? join(filepath, filename) : "");
    return {
      url,
      domain,
      filepath,
      filename,
      bucket,
      endpoint: `https://${bucket}.${region}.aliyuncs.com`,
      region,
      credentials: {
        accessKeyId: token.credentials.AccessKeyId,
        accessKeySecret: token.credentials.AccessKeySecret,
        securityToken: token.credentials.SecurityToken,
        expiration: token.credentials.Expiration,
      },
    };
  }
  _ossClient(ossConfig) {
    let { region, bucket } = ossConfig;
    return new OSS({
      region,
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      bucket,
    });
  }

  async signature(ctx) {
    // 参数验证
    ctx.validateAsync({
      query: {
        bucket: Joi.string().allow(undefined, null, ""),
      },
      status: 10001,
    });

    let {
      bucket: aliossType = "default",
    } = ctx.query;
    // 获取配置
    const { ali } = this.config;
    const ossConfig = ali[aliossType];
    try {
      const { filename } = req.query;
      const fileName = ossService.generateFileName(filename);
      let { domain } = ossConfig;
      const client = this._ossClient(ossConfig);
      const result = await client.calculatePostSignature({
        expiration: ossConfig.expiration || 15 * 60,
      });
      ctx.respond({
        signature: result.signature,
        policy: result.policy,
        accessKeyId: ossConfig.accessKeyId,
        host: domain,
        key: fileName,
        expire: result.expiration,
      })

    } catch (error) {
      console.error('生成签名失败:', error);
      ctx.throw(500, "生成上传签名失败");
    }
  }


  async setupOSSCORS(ctx) {
    let {
      bucket: aliossType = "default",
    } = ctx.query;
    // 获取配置
    const { ali } = this.config;
    const ossConfig = ali[aliossType];
    const client = this._ossClient(ossConfig);
    const corsRules = [
      {
        allowedOrigin: ['*', "http://127.0.0.1:5173", "http://localhost:5173"],
        allowedMethod: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
        allowedHeader: ["Content-Type",
          "Authorization",
          "Accept",
          "X-Requested-With",
          "Origin",
          'starttime',    // 添加你的自定义头部
          'endtime',      // 添加你的自定义头部
          "Access-Control-Allow-Origin"],
        exposeHeader: ['ETag', 'x-oss-request-id'],
        maxAgeSeconds: 0
      }
    ];

    try {
      await client.putBucketCORS(ossConfig.bucket, corsRules);
      const result = await client.getBucketCORS(ossConfig.bucket);
      console.log('OSS CORS 规则配置成功');
      ctx.body = { message: 'OSS CORS 规则配置成功', rules: result.rules };
    } catch (error) {
      console.error('配置 CORS 失败:', error);
      ctx.body = '配置 CORS 失败';
    }
  };
};
