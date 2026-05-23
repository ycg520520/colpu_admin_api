/**
 * @Author: colpu
 * @Date: 2025-09-17 15:22:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-21 09:03:29
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import crypto from "crypto";
import Joi from "joi";
import { Controller } from "@colpu/core";
import jwt from "jsonwebtoken";
import cryptoUtil from "../utils/crypto.js";
import WechatOAuth from '../utils/wechat/auth.js';
import { THIRD_AUTH_TYPE } from "../constants/third_auth.js";
const refreshTokenAddMaxAge = 1728e5; // 48小时，单位毫秒
// const refreshTokenAddMaxAge = 10e3; // 10秒钟，测试用
export default class AuthController extends Controller {
  /**
   * @api {post} /token
   * @apiName token
   * @apiDescription 获取访问令牌（OAuth2 兼容）。后台登录常用 grant_type：password（账号密码）、sms（手机验证码）。
   * @apiGroup Auth
   * @apiVersion  1.0.0
   *
   * @apiBody {String} grant_type 授权类型 [code, password, credentials, refresh_token, applet, sms]
   * @apiBody {String} [client_id] 客户端 ID（可选，也可通过 Header `x-client-id` 传递）
   * @apiBody {String} [scope] 授权范围，多个用 ; 分隔（可选）
   * @apiBody {String} [username] 用户名（password 模式必填）
   * @apiBody {String} [password] 密码（password 模式必填）
   * @apiBody {String} [mobile] 手机号，11 位（sms 模式必填，需先 POST /sms/send）
   * @apiBody {String} [code] 短信验证码 4 位（sms 模式必填）；或授权码（code 模式必填）
   * @apiBody {String} [secret] 客户端密钥（credentials 模式必填）
   * @apiBody {String} [refresh_token] 刷新令牌（refresh_token 模式必填）
   * @apiBody {String} [redirect_uri] 重定向 URI（可选）
   *
   * @apiSuccessExample {json} 账号密码登录:
   * HTTP/1.1 200 OK
   * {
   *   "token_type": "Bearer",
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "expires_in": 3600,
   *   "refresh_token": "def50200e5b0...",
   *   "client_id": "client_id",
   *   "scope": ["scope"]
   * }
   *
   * @apiSuccessExample {json} 手机验证码登录 (grant_type=sms):
   * POST /token
   * { "grant_type": "sms", "mobile": "13800138000", "code": "1234" }
   *
   * @apiErrorExample {json} 账号密码错误:
   * HTTP/1.1 401 Unauthorized
   * { "message": "Invalid username or password" }
   * @apiErrorExample {json} 验证码错误或手机号未绑定:
   * HTTP/1.1 401 Unauthorized
   * { "message": "验证码错误或已过期" }
   * { "message": "该手机号未绑定后台账号" }
   */

  async token(ctx) {
    const validateType = this._getValidateType(ctx);
    const { grant_type } = ctx.validate({
      [validateType]: {
        grant_type: Joi.string().required(), // 授权类型
      },
    });
    const client = await this._getVerifyClient(ctx);
    let tokens;
    switch (grant_type) {
      // 授权码模式
      case "code":
        tokens = this._codeToken(ctx, client);
        break;
      // 密码模式
      case "password":
        tokens = await this._passwordToken(ctx, client);
        break;
      // 客户端凭证模式
      case "credentials":
        tokens = await this._credentialsToken(ctx, client);
        break;
      // 刷新令牌
      case "refresh_token":
        tokens = await this._refreshToken(ctx);
        break;
      case "applet":
        tokens = await this._appletToken(ctx, client);
        break;
      case "sms":
        tokens = await this._smsToken(ctx, client);
        break;
      default:
        ctx.throw(401, "没有参数: grant_type");
    }

    // 存储 refresh_token（用于刷新/吊销等扩展能力）
    if (tokens?.refresh_token) {
      await this._setRefreshToken(ctx, tokens);
    }
    ctx.respond(tokens);
  }

  /**
   * @api {get} /authorize
   * @apiName authorize 用户授权
   * @apiDescription 用户授权，支持授权码模式和隐式模式
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiParam {String} grant_type 授权类型，值为code或者token (必需) [code, token]
   * @apiParam {String} client_id 客服端ID (必需)
   * @apiParam {String} redirect_uri 重定向URI (必需)
   * @apiParam {String} [scope] 授权范围 (可选) [api:read, api:write]
   * @apiParam {String} [state] 状态 (可选) [任意值，原样返回]， 防CSRF攻击：使用state参数验证请求来源，确保授权请求和回调来自同一会话
   * @apiHeader {String} Authorization 授权获取的access_token (可选，仅隐式模式需要)
   * @apiExample {text} Success-Response:
   * 授权码模式
   * Location: https://client.example.com/cb?code=AUTH_CODE&state=xyz
   * 隐式模式
   * Location: https://client.example.com/cb?access_token=ACCESS_TOKEN&token_type=Bearer&expires_in=3600&state=xyz
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 401 Unauthorized
   * {
   *   "error": "invalid_grant",
   *   "error_description": "Invalid authorization code"
   * }
   */
  async authorize(ctx) {
    const { grant_type, client_id, redirect_uri, scope, state } = ctx.validate({
      query: {
        grant_type: Joi.string().required(),
        client_id: Joi.string().required(),
        redirect_uri: Joi.string().required(),
        scope: Joi.string().optional().allow("", null),
        state: Joi.string().optional().allow("", null),
      },
    });

    // 验证客户端
    const client = await this.service.clients.findOne(client_id);
    if (!client) {
      ctx.throw(401, "Invalid client_id");
    }

    // 验证重定向URI
    if (!client.redirect_uris.includes(redirect_uri)) {
      ctx.throw(401, "Invalid redirect_uri");
    }

    // 检查用户是否已登录
    if (!ctx.session || !ctx.session.user) {
      // 重定向到登录页面
      const uri = ctx.utils.setURL(
        "login",
        {
          redirect_uri,
        },
        ctx.origin
      );
      return ctx.redirect(uri.href);
    }

    const user = ctx.session.user;

    if (grant_type === "code") {
      // code授权码模式
      const code = crypto.randomBytes(16).toString("hex");
      await ctx.app.redis.use(0).set(
        `CODE:${code}`,
        JSON.stringify({ user, client, scope }),
        "PX",
        3e5 // 5分钟后过期
      );
      const uri = ctx.utils.setURL(redirect_uri, { code, state });
      ctx.redirect(uri.href);
    } else if (grant_type === "token") {
      // token隐式模式
      const { access_token, token_type, expires_in } = this._generateToken(
        user,
        client,
        scope
      );
      const uri = ctx.utils.setURL(redirect_uri, {
        access_token,
        token_type,
        expires_in,
        state,
      });

      ctx.redirect(uri.href);
    } else {
      ctx.throw(401, "Unsupported grant_type");
    }
  }


  /**
   * @api {post} /login
   * @apiName login
   * @apiDescription 已登录用户会话校验（需携带 access_token）
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer access_token
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * "ok login"
   */
  async login(ctx) {
    ctx.respond("ok login");
  }

  /**
   * @api {post} /sms/send
   * @apiName sendSms
   * @apiDescription 发送手机登录验证码。同一手机号 60 秒内限发一次，验证码 5 分钟有效。
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiBody {String} mobile 手机号，11 位，1 开头
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "mobile": "13800138000",
   *   "expires_in": 300
   * }
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 429 Too Many Requests
   * { "message": "发送过于频繁，请稍后再试" }
   */
  async sendSms(ctx) {
    const { mobile } = ctx.validate({
      body: {
        mobile: Joi.string()
          .pattern(/^1\d{10}$/)
          .required(),
      },
    });
    const data = await this.service.login.sendSmsCode(ctx, mobile);
    ctx.respond(data, null, "验证码已发送");
  }

  /**
   * @api {get} /oauth/:provider/start
   * @apiName oauthStart
   * @apiDescription 发起三方登录。微信返回二维码数据；支付宝/淘宝/微博返回授权跳转链接。
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiParam {String} provider 登录渠道 [wechat, alipay, taobao, weibo]
   * @apiSuccessExample {json} 微信 Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "provider": "wechat",
   *   "state": "a1b2c3...",
   *   "auth_url": "https://open.weixin.qq.com/connect/qrconnect?...",
   *   "qr_image": "data:image/png;base64,...",
   *   "expires_in": 300
   * }
   * @apiSuccessExample {json} 其他三方 Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "provider": "weibo",
   *   "state": "a1b2c3...",
   *   "auth_url": "https://api.weibo.com/oauth2/authorize?...",
   *   "expires_in": 300
   * }
   */
  async oauthStart(ctx) {
    const { provider } = ctx.validate({
      params: {
        provider: Joi.string()
          .valid("wechat", "qq", "alipay", "taobao", "weibo")
          .required(),
      },
    });
    const data = await this.service.login.startOAuth(ctx, provider);
    ctx.respond(data);
  }

  /**
   * @api {get} /oauth/poll
   * @apiName oauthPoll
   * @apiDescription 轮询三方登录状态（前端每 2 秒请求一次，state 来自 /oauth/:provider/start）
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiQuery {String} state 登录场景标识
   * @apiSuccessExample {json} 等待中:
   * HTTP/1.1 200 OK
   * { "status": "pending", "provider": "wechat" }
   * @apiSuccessExample {json} 登录成功:
   * HTTP/1.1 200 OK
   * {
   *   "status": "ok",
   *   "tokens": {
   *     "token_type": "Bearer",
   *     "access_token": "...",
   *     "expires_in": 3600,
   *     "refresh_token": "..."
   *   }
   * }
   * @apiSuccessExample {json} 失败或过期:
   * HTTP/1.1 200 OK
   * { "status": "error", "message": "三方账号未绑定" }
   * { "status": "expired" }
   */
  async oauthPoll(ctx) {
    const { state } = ctx.validate({
      query: { state: Joi.string().required() },
    });
    const data = await this.service.login.pollOAuth(ctx, state);
    ctx.respond(data);
  }

  _oauthCallbackHtml(ctx, result, provider) {
    const title = result.ok ? "登录成功" : "登录失败";
    const msg = result.message || "";
    ctx.type = "text/html; charset=utf-8";
    ctx.body = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:sans-serif;text-align:center;padding:48px;">
<h2>${title}</h2><p>${msg}</p>
<p style="color:#888;font-size:14px;">请关闭此窗口并返回管理后台</p>
<script>if(window.opener){try{window.opener.postMessage({type:'oauth-login',provider:'${provider}',ok:${result.ok}},'*');}catch(e){}}</script>
</body></html>`;
  }

  /**
   * @api {get} /oauth/:provider/callback
   * @apiName oauthCallback
   * @apiDescription 三方 OAuth 授权回调（由开放平台浏览器跳转，非前端直接调用）。成功后写入 Redis 供 /oauth/poll 读取，并返回 HTML 提示页。
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiParam {String} provider 登录渠道 [wechat, alipay, taobao, weibo]
   * @apiQuery {String} code 授权码
   * @apiQuery {String} state 与 /oauth/:provider/start 返回的 state 一致
   * @apiSuccessExample {html} Success-Response:
   * HTTP/1.1 200 OK
   * 登录成功 / 登录失败 提示页（含 postMessage 通知 opener）
   */
  async oauthCallback(ctx) {
    const { provider } = ctx.validate({
      params: {
        provider: Joi.string()
          .valid("wechat", "qq", "alipay", "taobao", "weibo")
          .required(),
      },
    });
    const { code, state } = ctx.validate({
      query: {
        code: Joi.string().required(),
        state: Joi.string().required(),
      },
    });
    const result = await this.service.login.handleOAuthCallback(
      ctx,
      provider,
      code,
      state,
      (user, client, scope) => this._generateToken(user, client, scope),
    );
    this._oauthCallbackHtml(ctx, result, provider);
  }

  // grant_type=sms：校验短信验证码并签发 token（见 POST /token 文档）
  async _smsToken(ctx, client) {
    const { mobile, code } = ctx.validate({
      body: {
        mobile: Joi.string()
          .pattern(/^1\d{10}$/)
          .required(),
        code: Joi.string().length(4).required(),
      },
    });
    const user = await this.service.login.verifySmsCode(ctx, mobile, code);
    const tokens = this._generateToken(user, client);
    user.tokens = tokens;
    ctx.session.user = user;
    return tokens;
  }

  /**
   * @api {post} /logout
   * @apiName logout
   * @apiDescription 退出登录，清除服务端 session
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer access_token
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * "logout success"
   */
  async logout(ctx) {
    ctx.state.user = null;
    ctx.session.user = null; // 清除session
    ctx.respond('logout success');
  }

  /**
   * @api {get} /verify
   * @apiName verify
   * @apiDescription 验证 access_token 是否有效
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer access_token
   * @apiQuery {String} [client_id] 客户端 ID（可选）
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * { "valid": true, "uid": "user_uid" }
   */
  async verify(ctx) {
    const tokens = await this._verifyToken(ctx);
    ctx.respond({ valid: true, uid: tokens.uid }, 0, "验证通过");
  }

  async _verifyToken(ctx) {
    // 验证客户端
    const client = await this._getVerifyClient(ctx);
    // 验证token
    const token = ctx.headers.authorization?.split(" ")[1];
    const tokens = this._getVerifyToken(ctx, token, client.secret_key);
    if (client.client_id) {
      if (!this._validateClientId(tokens.client_id, client.client_id)) {
        ctx.throw(401, "Invalid client_id");
      }
    }
    return tokens;
  }

  _getVerifyToken(ctx, token, secretKey) {
    // 检查令牌是否存在
    if (!token) {
      ctx.throw(401, "No token provided");
    }
    // 验证令牌
    try {
      return jwt.verify(token, secretKey);
    } catch (err) {
      ctx.throw(401, "Invalid token");
    }
  }

  async _passwordToken(ctx, client) {
    ctx.validate({
      body: {
        username: Joi.string().required(), // 用户名
        password: Joi.string().required(), // 密码
      },
    });
    const { username, password, scope } = ctx.request.body;
    const res = await this.service.users.findUser({ username },
      ["id", "uid", 'password', 'username']
    );
    if (!res || !await res.comparePassword(password)) {
      ctx.throw(401, "Invalid username or password");
    }
    const user = res.dataValues;
    const tokens = this._generateToken(user, client, scope);
    // 存储用户session
    user.tokens = tokens;
    ctx.session.user = user;

    return tokens;
  }

  async _codeToken(ctx, client) {
    const { code } = ctx.validate({
      body: {
        code: Joi.string().required(), // 授权码
      },
    });
    const codeResStr = await ctx.app.redis.use(0).get(`CODE:${code}`);
    if (!codeResStr) {
      ctx.throw(401, "Invalid or expired authorization code");
    }
    const codeRes = JSON.parse(codeResStr);
    // 验证授权码绑定的客户端与当前请求客户端一致
    if (!this._validateClientId(codeRes.client?.client_id, client?.client_id)) {
      ctx.throw(401, "Invalid client_id");
    }
    const tokens = this._generateToken(codeRes.user, client, codeRes.scope);
    return tokens;
  }

  async _credentialsToken(ctx, client) {
    const { secret, scope } = ctx.validate({
      body: {
        secret: Joi.string().required(), // 客户端密钥
        scope: Joi.string().optional().allow("", null),
      },
    });
    if (client.secret_key !== secret) {
      ctx.throw(401, "Client authentication failed");
    }
    const tokens = this._generateToken({}, client, scope);
    return tokens;
  }

  /**
   * @function appletToken 小程序授权登陆获取Token
   * @apiBody {String} code wx.login 获得的临时code
   * @apiBody {String} client_id 对应小程序的appId
   */
  async _appletToken(ctx, client) {
    const validateType = this._getValidateType(ctx);
    const { code, scope } = ctx.validate({
      [validateType]: {
        code: Joi.string().required(),
        scope: Joi.string().optional().allow("", null),
      },
    });

    const api = new WechatOAuth({
      appId: client.client_id,
      appSecret: client.secret_key,
      redirectUri: client.redirect_uris, // ??? 这里需要调整
    });
    const res = await api.code2Session(code);
    const { session_key, openid, unionid } = res;
    if (!session_key) {
      ctx.throw(10004, "需要重新配置微信环境白名单IP地址");
    }
    const userInfo = await this.service.third.create({
      openid,
      unionid,
      type: THIRD_AUTH_TYPE.WECHAT,
    });
    const tokens = this._generateToken(userInfo, client, scope);
    return tokens;
  }

  /**
   * @function _refreshToken 刷新令牌
   * @apiParam {Object} ctx Koa上下文
   * @returns {Promise<unknown>} 返回新的token
   */
  async _refreshToken(ctx) {
    // ctx.throw(500, "服务器错误");
    const validateType = this._getValidateType(ctx);
    const { refresh_token, scope } = ctx.validate({
      [validateType]: {
        refresh_token: Joi.string().required(), // 刷新令牌;
      }
    });

    // 可选：如果服务端存储了 refresh_token，则要求 refresh_token 必须存在
    const storeKey = this._refreshTokenKey(refresh_token);
    const storedStr = await ctx.app.redis.use(0).get(storeKey);
    if (storedStr) {
      // 刷新成功后删除旧 refresh_token，实现简单轮换
      await ctx.app.redis.use(0).del(storeKey);
    }

    // 验证客户端
    const client = await this._getVerifyClient(ctx);
    const oldTokens = this._getVerifyToken(ctx, refresh_token, client.secret_key);
    if (client.client_id !== oldTokens.client_id) {
      ctx.throw(401, "Invalid client_id");
    }

    // 生成新的访问令牌
    const tokens = this._generateToken(oldTokens, client, scope);
    // 写入新 refresh_token
    await this._setRefreshToken(ctx, tokens);
    return tokens;
  }

  _refreshTokenKey(refresh_token) {
    const md5Name = cryptoUtil.md5(refresh_token);
    return `REFRESH_TOKEN:${md5Name}`;
  }

  /**
   * @function _setRefreshToken 存储refresh_token
   * @apiParam {Object} ctx
   * @apiParam {Object} tokens
   */
  async _setRefreshToken(ctx, tokens) {
    const { maxAge = 864e5 } = this.config.session || {};
    const refreshTokenExpire = maxAge + refreshTokenAddMaxAge;
    await ctx.app.redis
      .use(0)
      .set(
        this._refreshTokenKey(tokens.refresh_token),
        JSON.stringify(tokens),
        "PX",
        refreshTokenExpire
      );
  }

  /**
   * @function _generateToken 生成token
   * @apiParam {Object} data 用户信息
   * @apiParam {Object} client 客户端信息
   * @apiParam {String} scope 授权范围
   * @returns {String} 返回生成的token
   */
  _generateToken(data, client, scope) {
    // maxAge 采用毫秒单位，默认 24 小时
    const { maxAge = 864e5 } = this.config.session || {};
    const { client_id } = client || {};
    // OAuth2 标准：expires_in 为剩余有效秒数
    const expires_in = Math.floor(maxAge / 1000);
    const signData = {
      id: data.id,
      uid: data.uid,
      username: data.username,
      client_id,
      scope,
    };
    const access_token = jwt.sign(signData, client.secret_key,
      { expiresIn: Math.floor(maxAge / 1000) }
    );

    const refreshMaxAge = maxAge + refreshTokenAddMaxAge; // 2小时后刷新token过期，单位毫秒
    const refresh_token = jwt.sign(signData, client.secret_key,
      { expiresIn: Math.floor(refreshMaxAge / 1000) }
    );

    return {
      token_type: "Bearer",
      access_token,
      expires_in,
      refresh_token,
      client_id,
      scope,
    };
  }


  async _getClient(ctx) {

  }

  async _getVerifyClient(ctx) {
    let client = this.config.jwt;
    const validateType = this._getValidateType(ctx);
    const { scope } = ctx.validate({
      [validateType]: {
        scope: Joi.string().optional().allow("", null),
      },
    });
    const client_id = ctx.headers['x-client-id'] || ctx.query.client_id;
    if (client_id) {
      // 从数据库加载客户端配置
      client = await this.service.clients.findOne(client_id);
      if (!client) {
        ctx.throw(401, "Invalid client_id");
      }

      // 验证权限范围
      this._validateScopes(client.scope || [], (scope || '').split(";"));

    }
    return client;
  }

  /**
   * @function _validateScopes 验证权限范围
   * @apiParam {Array} clientScopes 客服端scope
   * @apiParam {Array} reqScopes 请求scope
   * @returns {String} 返回权限scope
   */
  _validateScopes(clientScopes, reqScopes) {
    let authScopes = [];
    if (clientScopes.length === 0) {
      authScopes = ['*']; // 默认返回客户端所有权限
    } else {
      authScopes = reqScopes.filter((scope) => clientScopes.includes(scope));
    }
    if (!authScopes.length && reqScopes.length) {
      ctx.throw(401, "Invalid scope");
    }
  }

  _validateClientId(client_id, req_client_id) {
    // 不存在client_id和req_client_id时，视为通过，
    if (!client_id || !req_client_id) return true;
    if (client_id === req_client_id) return true;
    return false;
  }

  _getValidateType(ctx) {
    return ctx.method.toUpperCase() === "GET" ? "query" : "body";
  }
}
