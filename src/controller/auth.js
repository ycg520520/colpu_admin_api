/**
 * @Author: colpu
 * @Date: 2025-09-17 15:22:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-11 15:36:25
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import crypto from "crypto";
import Joi from "joi";
import { Controller } from "@colpu/core";
import jwt from "jsonwebtoken";
import cryptoUtil from "../utils/crypto.js";
const refreshTokenAddMaxAge = 72e5; // 2小时，单位毫秒
export default class AuthController extends Controller {
  /**·
   * @api {post} /token
   * @apiName token
   * @apiDescription 生成token
   * @apiGroup Auth
   * @apiVersion  1.0.0
   *
   * @apiBody {String} grant_type 授权类型 [code, password, credentials, refresh_token]
   * @apiBody {String} [client_id] 客服端ID (可选)
   * @apiBody {String} [code] 授权码code模式，需要传递code (可选)
   * @apiBody {String} [scope] 授权范围，多个用;分隔 (可选)
   * @apiBody {String} [secret] 客户端密钥，使用client_id和secret进行严格认证，密钥需要安全存储，不能暴露给前端
   * @apiBody {String} [username] 用户名 (可选)
   * @apiBody {String} [password] 密码 (可选)
   * @apiBody {String} [redirect_uri] 重定向URI (可选)
   * @apiBody {String} [refresh_token] 刷新令牌 (可选)
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "token_type": "Bearer", // 返回token类型
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 返回token
   *   "expires_in": 3600, // 剩余有效秒数（OAuth2 标准）
   *   "refresh_token": "def50200e5b0...", // 返回刷新令牌
   *   "client_id": "client_id", // 返回客户端ID
   *   "scope": ["scope"] // 返回权限范围
   * }
   */

  async token(ctx) {
    const validateFunc = ctx.method.toUpperCase() === "GET" ? "query" : "body";
    const { grant_type, client_id, scope } = ctx.validateAsync({
      [validateFunc]: {
        grant_type: Joi.string().required(), // 授权类型
        client_id: Joi.string().optional().allow("", null), // 客户端ID
      },
    });

    let client = this.config.jwt;
    if (client_id) {
      // 从数据库加载客户端配置
      client = await this.service.clients.findOne(client_id);
      if (!client) {
        ctx.throw(401, "Invalid client_id");
      }

      // 验证权限范围
      const reqScopes = scope ? scope.split(";") : []; // 请求scope
      const authScopes = this._validateScopes(client.scope || [], reqScopes);
      if (!authScopes.length && reqScopes.length) {
        ctx.throw(401, "Invalid scope");
      }
    }

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
    ctx.validateAsync({
      query: {
        grant_type: Joi.string().required(),
        client_id: Joi.string().required(),
        redirect_uri: Joi.string().required(),
        scope: Joi.string().optional().allow("", null),
        state: Joi.string().optional().allow("", null),
      },
    });

    const { grant_type, client_id, redirect_uri, scope, state } = ctx.query;

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


  async login(ctx) {
    ctx.respond('ok login');
  }

  async logout(ctx) {
    ctx.state.user = null;
    ctx.session.user = null; // 清除session
    ctx.respond('logout success');
  }

  /**
   * @function verify 验证token
   * @apiParam {String} client_id 客服端ID
   * @headers {String} Authorization 授权获取的access_token
   * @returns
   */
  async verify(ctx) {
    const tokens = await this._verify(ctx);
    ctx.respond({ valid: true, uid: tokens.uid }, 0, "验证通过");
  }

  async _verify(ctx) {
    // 验证客户端
    const { client, client_id } = await this._getVerifyClient(ctx);
    // 验证token
    const token = ctx.headers.authorization?.split(" ")[1];
    const tokens = this._getVerifyToken(ctx, token, client.secret_key);
    if (client_id) {
      if (!this._validateClientId(tokens.client_id, client_id)) {
        ctx.throw(401, "Invalid client_id");
      }
    }
    return tokens;
  }

  async _getVerifyClient(ctx) {
    // 验证客户端
    const { client_id } = ctx.validateAsync({
      query: {
        client_id: Joi.string().optional().allow("", null),
      },
    });
    let client = this.config.jwt;
    if (client_id) {
      client = await this.service.clients.findOne(client_id);
      if (!client) {
        ctx.throw(401, "Invalid client_id");
      }
    }
    return { client, client_id };
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
    ctx.validateAsync({
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
    const { code } = ctx.validateAsync({
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
    const { secret, scope } = ctx.validateAsync({
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
   * @function _refreshToken 刷新令牌
   * @apiParam {Object} ctx Koa上下文
   * @returns {Promise<unknown>} 返回新的token
   */
  async _refreshToken(ctx) {
    // ctx.throw(500, "服务器错误");
    const validateFunc = ctx.method.toUpperCase() === "GET" ? "query" : "body";
    const { refresh_token, scope } = ctx.validateAsync({
      [validateFunc]: {
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
    const { client, client_id } = await this._getVerifyClient(ctx);
    const oldTokens = this._getVerifyToken(ctx, refresh_token, client.secret_key);
    if (client_id) {
      if (!this._validateClientId(oldTokens.client_id, client_id)) {
        ctx.throw(401, "Invalid client_id");
      }
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

  /**
   * @function _validateScopes 验证权限范围
   * @apiParam {Array} clientScopes 客服端scope
   * @apiParam {Array} reqScopes 请求scope
   * @returns {String} 返回权限scope
   */
  _validateScopes(clientScopes, reqScopes) {
    if (reqScopes.length === 0) {
      return clientScopes || ['all']; // 默认返回客户端所有权限
    }
    return reqScopes.filter((scope) => clientScopes.includes(scope));
  }

  _validateClientId(client_id, req_client_id) {
    // 不存在client_id和req_client_id时，视为通过，
    if (!client_id || !req_client_id) return true;
    if (client_id === req_client_id) return true;
    return false;
  }
}
