/**
 * @Author: colpu
 * @Date: 2026-02-13 22:42:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 11:30:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { stringify } from 'querystring';
class AccessToken {
  constructor(data) {
    if (!(this instanceof AccessToken)) {
      return new AccessToken(data);
    }
    this.data = data;
  }
  /*!
   * 检查AccessToken是否有效，检查规则为当前时间和过期时间进行对比
   *
   * Examples:
   * ```
   * token.isValid();
   * ```
   */
  isValid() {
    return !!this.data.access_token && (new Date().getTime()) < (this.data.created_at + this.data.expires_in * 1000);
  }
}

/**
 * 根据appid和appSecret创建OAuth接口的构造函数
 * 如需跨进程跨机器进行操作，access_token需要进行全局维护
 * 使用使用token的优先级是：
 *
 * 1. 使用当前缓存的token对象
 * 2. 调用开发传入的获取token的异步方法，获得token之后使用（并缓存它）。

 * Examples:
 * ```
 * import WechatOAuth from './wechat_oauth.js';
 * const api = new WechatOAuth({appid, appSecret});
 * ```
 * @param {Object} options 配置项
 * @param {String} options.appId 在公众平台上申请得到的appid
 * @param {String} options.appSecret 在公众平台上申请得到的app secret
 * @param {Generator} options.getToken 用于获取token的方法
 * @param {Generator} options.saveToken 用于保存token的方法
 */
export default class WechatOAuth {
  baseApi = 'https://api.weixin.qq.com';
  openApi = 'https://open.weixin.qq.com';
  mpApi = 'https://mp.weixin.qq.com';

  constructor(options) {
    // 这里的store是一个简单的内存对象，用于存储token、state数据。在生产环境中，你应该使用一个更持久化的存储方案，比如数据库或者Redis。
    this.store = new Map(); // 存储state -> 状态码 的映射
    this.setOptions(options);
    this.defaults = {
      method: 'GET',
    };
  }

  setOptions(options) {
    this.options = options;
    const { appId, appSecret, redirectUri, getItem, setItem } = options;
    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = encodeURIComponent(redirectUri);

    if (!setItem && process.env.NODE_ENV === 'production') {
      console.warn("请不要在生产环境存储token，请使用持久化存储方式来保存token");
    }
    this.getItem = getItem || function (key) {
      return this.store.get(key);
    };
    this.setItem = setItem || function (key, value) {
      this.store.set(key, value);
    };
  }

  /**
   * 用于设置request的默认options
   *
   * Examples:
   * ```
   * oauth.setRequestOpts({timeout: 15000});
   * ```
   * @param {Object} opts 默认选项
   */
  setRequestOpts(opts) {
    this.defaults = opts;
  }

  /**
   * fetch的封装
   *
   * @param {String} url 路径
   * @param {Object} opts fetch选项
   */
  async request(url, ...args) {
    if (!url.startsWith('http')) {
      url = this.baseApi + url;
    }
    const options = Object.assign({}, this.defaults, args[1] || {});
    const body = args[0];
    const { method = 'GET' } = options;
    if (['GET', 'DELETE'].includes(method)) {
      const u = new URL(url)
      for (const key in body) {
        u.searchParams.set(key, body[key]);
      }
      url = u.toString();
    } else {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options)
      .then(response => response.json())
      .then(data => {
        if (data.errcode) {
          const err = new Error(data.errmsg);
          err.name = 'WeChatAPIError';
          err.code = data.errcode;
          return Promise.reject(err);
        }
        return data;
      });
  }

  /**
   * 获取授权页面的URL地址
   * @param {String} state 开发者可提供的数据
   * @param {String} scope 作用范围，值为snsapi_userinfo和snsapi_base，前者用于弹出，后者用于跳转
   */
  getAuthorizeURL(state, scope) {
    const url = `${this.openApi}/connect/oauth2/authorize`;
    const info = {
      appid: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scope || 'snsapi_base',
      state: state || ''
    };
    this.setItem(state, { status: 'pending', created_at: Date.now() }); // 保存state状态码
    return url + '?' + stringify(info) + '#wechat_redirect';
  }

  /**
   * 获取授权页面的URL地址
   * @description
   * 微信扫码登录的URL地址，适用于PC网站，微信扫码后会回调redirectUri，并携带code和state参数。
   * 开发者可以通过code参数获取access_token和openid等信息。
   * 注意：微信扫码登录的URL地址和普通的OAuth授权URL地址不同，
   * 前者是`/connect/qrconnect`，后者是`/connect/oauth2/authorize`。
   * 因此，我们需要在这里单独处理一下，生成微信扫码登录的URL地址。
   * @param {String} state 开发者可提供的数据
   * @param {String} scope 作用范围，值为snsapi_login，前者用于弹出，后者用于跳转
   */
  getQrConnectURL(state, scope) {
    const url = `${this.openApi}/connect/qrconnect`;
    const info = {
      appid: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scope || 'snsapi_login',
      state: state || ''
    };
    this.setItem(state, { status: 'pending', created_at: Date.now() }); // 保存state状态码
    return url + '?' + stringify(info) + '#wechat_redirect';
  }

  /**
   * @function getQrCodeTicket
   * @description
   * 获取二维码ticket，微信扫码登录需要使用这个ticket来生成二维码图片，用户扫码后会回调redirectUri，并携带code和state参数。
   * @param {String} scene_id 场景值，开发者可以自己定义，用于区分不同的扫码登录场景，比如登录、绑定等。
     微信扫码登录的场景值必须为整数，且不能重复，否则会导致扫码登录失败。
   * @returns {Promise} ticket 微信扫码登录的ticket，可以用来生成二维码图片
   * @example
   * const ticket = await wechatOAuth.getQrCodeTicket(scene_id);
   * // 生成二维码图片，用户扫码后会回调redirectUri，并携带code和state参数。
   * const qrImage = await QRCode.toDataURL(`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket}`);
   * @throws {Error} 获取二维码ticket出现异常时的异常对象
   */
  async getQrCodeTicketURL(scene_id) {
    const { access_token } = await this.getAccessToken();
    const url = `/cgi-bin/qrcode/create?access_token=${access_token}`;
    const data = {
      expire_seconds: 1800, // 过期时间，单位为秒，最大不超过1800
      action_name: 'QR_LIMIT_SCENE',
      action_info: {
        scene: {
          scene_id
        }
      }
    };
    const res = await this.request(url, data);
    const qrcodeUrl = `${this.mpApi}/cgi-bin/showqrcode?ticket=${encodeURIComponent(res.ticket)}`;
    return qrcodeUrl;
  }

  /**
   * 处理token，更新过期时间
   * @param {Object} data 微信返回的token数据
   * @return {Object} 处理后的token数据
   * @description 微信返回的token数据包含access_token、expires_in、refresh_token、openid和scope等字段。我们需要在这里处理一下，添加一个created_at字段来记录token的创建时间，以便后续判断token是否过期。
   * 另外，我们还可以在这里进行一些额外的处理，比如将token存储到数据库或者缓存中，或者进行一些日志记录等操作。
   * 这个函数的主要目的是为了统一处理微信返回的token数据，确保我们在使用token时能够正确地判断它是否过期，并且方便我们进行后续的操作。
   * Examples:
   * ```
   * const tokenData = await wechatOAuth.getAccessToken(code);
   * const processedToken = await wechatOAuth.processToken(tokenData);
   * ```
   * @param {Object} data 微信返回的token数据
   * @return {Object} 处理后的token数据
   */
  async processToken(data) {
    data.created_at = new Date().getTime();
    // 存储token
    await this.setItem(data.openid, data);
    return AccessToken(data);
  }

  /**
   * 根据授权获取到的code，换取access_token和openid
   * 获取openid之后，可以调用`wechat.API`来获取更多信息
   * Examples:
   * ```
   * api.getAccessToken(); // 获取全局access_token
   * api.getAccessToken(code); // 获取用户access_token和openid
   * ```
   * Exception:
   *
   * - `err`, 获取access token出现异常时的异常对象
   *
   * 返回值:
   * ```
   * {
   *  data: {
   *    "access_token": "ACCESS_TOKEN",
   *    "expires_in": 7200,
   *    "refresh_token": "REFRESH_TOKEN",
   *    "openid": "OPENID",
   *    "scope": "SCOPE"
   *  }
   * }
   * ```
   * @param {String} [code] 授权获取到的code
   */
  async getAccessToken(code) {
    let url = `/sns/oauth2/access_token`;
    const data = {
      appid: this.appId,
      secret: this.appSecret,
      grant_type: 'authorization_code'
    };
    if (code) {
      data.code = code;
    } else {
      url = `/cgi-bin/token`;
      data.grant_type = 'client_credential'
    }
    const res = await this.request(url, data);
    if (code) {
      return this.processToken(res);
    }
    return res;
  }

  /**
   * 根据refresh_token，刷新access_token，调用getAccessToken后才有效
   * Examples:
   * ```
   * api.refreshAccessToken(refreshToken);
   * ```
   * Exception:
   *
   * - `err`, 刷新access_token出现异常时的异常对象
   *
   * Return:
   * ```
   * {
   *  data: {
   *    "access_token": "ACCESS_TOKEN",
   *    "expires_in": 7200,
   *    "refresh_token": "REFRESH_TOKEN",
   *    "openid": "OPENID",
   *    "scope": "SCOPE"
   *  }
   * }
   * ```
   * @param {String} refreshToken refreshToken
   */
  async refreshAccessToken(refreshToken) {
    const url = `/sns/oauth2/refresh_token`;
    const data = {
      appid: this.appId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    const res = await this.request(url, data);
    return this.processToken(res);
  }

  async _getUserInfo(options, accessToken) {
    const url = `/sns/userinfo`;
    const data = {
      access_token: accessToken,
      openid: options.openid,
      lang: options.lang || 'en'
    };
    return this.request(url, data);
  }

  /**
   * 根据openid，获取用户信息。
   * 当access_token无效时，自动通过refresh_token获取新的access_token。然后再获取用户信息
   * Examples:
   * ```
   * api.getUser(options);
   * ```
   *
   * Options:
   * ```
   * openId
   * // 或
   * {
   *  "openId": "the open Id", // 必须
   *  "lang": "the lang code" // zh_CN 简体，zh_TW 繁体，en 英语
   * }
   * ```
   * Callback:
   *
   * - `err`, 获取用户信息出现异常时的异常对象
   *
   * Result:
   * ```
   * {
   *  "openid": "OPENID",
   *  "nickname": "NICKNAME",
   *  "sex": "1",
   *  "province": "PROVINCE"
   *  "city": "CITY",
   *  "country": "COUNTRY",
   *  "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
   *  "privilege": [
   *    "PRIVILEGE1"
   *    "PRIVILEGE2"
   *  ]
   * }
   * ```
   * @param {Object|String} options 传入openid或者参见Options
   */
  async getUserInfo(options) {
    if (typeof options !== 'object') {
      options = {
        openid: options
      };
    }

    const data = await this.getItem(options.openid);

    // 没有token数据
    if (!data) {
      const error = new Error('No token for ' + options.openid + ', please authorize first.');
      error.name = 'NoOAuthTokenError';
      throw error;
    }
    const token = AccessToken(data);
    let accessToken;
    if (token.isValid()) {
      accessToken = token.data.access_token;
    } else {
      const newToken = await this.refreshAccessToken(token.data.refresh_token);
      accessToken = newToken.data.access_token;
    }
    return this._getUserInfo(options, accessToken);
  }

  async _verifyToken(openid, accessToken) {
    const url = `/sns/auth`;
    const data = {
      access_token: accessToken,
      openid: openid
    };
    return await this.request(url, data);
  }

  /**
   * 根据code，获取用户信息。
   * Examples:
   * ```
   * const user = api.getUserInfoByCode(code);
   * ```
   * Exception:
   *
   * - `err`, 获取用户信息出现异常时的异常对象
   *
   * Result:
   * ```
   * {
   *  "openid": "OPENID",
   *  "nickname": "NICKNAME",
   *  "sex": "1",
   *  "province": "PROVINCE"
   *  "city": "CITY",
   *  "country": "COUNTRY",
   *  "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
   *  "privilege": [
   *    "PRIVILEGE1"
   *    "PRIVILEGE2"
   *  ]
   * }
   * ```
   * @param {String} code 授权获取到的code
   */
  async getUserInfoByCode(code) {
    var token = await this.getAccessToken(code);
    return await this.getUserInfo(token.data.openid);
  }

  /**
   * 获取小程序登录用户登录信息
   * @description 获取微信session
   * 登录凭证校验。通过wx.login接口获得临时登录凭证code后传到开发者服务器调用此接口完成登录流程。
   * 文档地址：https://developers.weixin.qq.com/minigame/dev/api-backend/open-api/login/auth.code2Session.html#%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80
   * @param {*} code 
   * @returns 
   * {
   * "openid": "OPENID",
   * "session_key": "SESSIONKEY",
   * "unionid": "UNIONID"
   * "errcode": 40029,
   * "errmsg": "invalid code"
   * }
   */
  code2Session(code) {
    const url = `/sns/jscode2session`;
    const data =
    {
      grant_type: "authorization_code",
      appid: this.appId,
      secret: this.appSecret,
      js_code: code,
    };
    return this.request(url, data);
  }
}
