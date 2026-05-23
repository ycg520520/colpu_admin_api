/**
 * 后台登录：短信验证码、三方 OAuth（微信/QQ/支付宝/淘宝/微博）
 */
import crypto from "crypto";
import QRCode from "qrcode";
import WechatOAuth from "../utils/wechat/auth.js";
import { thirdAuth } from "../models/sys/index.js";
import Base from "./base.js";

const SMS_TTL_MS = 5 * 60 * 1000;
const SMS_RATE_MS = 60 * 1000;
const OAUTH_SCENE_TTL_MS = 5 * 60 * 1000;
const OAUTH_LOGIN_KEY = "OAUTH_LOGIN";

const OAUTH_REDIRECT_PROVIDERS = ["qq", "alipay", "taobao", "weibo"];

const PROVIDER_NAMES = {
  wechat: "微信",
  qq: "QQ",
  alipay: "支付宝",
  taobao: "淘宝",
  weibo: "微博",
};

export default class LoginService extends Base {
  isBackendUser(user) {
    const row = user?.dataValues || user;
    if (!row || row.status !== 1) return false;
    const prefix = this.config.default_user_prfix || "@AU@_";
    if (String(row.username || "").startsWith(prefix)) return false;
    return true;
  }

  async sendSmsCode(ctx, mobile) {
    const redis = ctx.app.redis.use(0);
    const rateKey = `SMS_RATE:${mobile}`;
    if (await redis.get(rateKey)) {
      const err = new Error("发送过于频繁，请稍后再试");
      err.status = 429;
      throw err;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    await redis.set(`SMS:${mobile}`, code, "PX", SMS_TTL_MS);
    await redis.set(rateKey, "1", "PX", SMS_RATE_MS);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[login.sms] ${mobile} => ${code}`);
    }
    return {
      mobile,
      expires_in: Math.floor(SMS_TTL_MS / 1000),
      ...(process.env.NODE_ENV !== "production" ? { mock_code: code } : {}),
    };
  }

  async verifySmsCode(ctx, mobile, code) {
    const redis = ctx.app.redis.use(0);
    const stored = await redis.get(`SMS:${mobile}`);
    if (!stored || stored !== String(code)) {
      const err = new Error("验证码错误或已过期");
      err.status = 401;
      throw err;
    }
    await redis.del(`SMS:${mobile}`);
    const row = await this.service.users.findUser(
      { phone: mobile },
      ["id", "uid", "username", "status"],
    );
    if (!row || !this.isBackendUser(row)) {
      const err = new Error("该手机号未绑定后台账号");
      err.status = 401;
      throw err;
    }
    return row.dataValues || row;
  }

  _oauthSceneKey(state) {
    return `${OAUTH_LOGIN_KEY}:${state}`;
  }

  async _initOAuthScene(ctx, state, provider) {
    const redis = ctx.app.redis.use(0);
    await redis.set(
      this._oauthSceneKey(state),
      JSON.stringify({ status: "pending", provider }),
      "PX",
      OAUTH_SCENE_TTL_MS,
    );
  }

  async _setOAuthScene(ctx, state, payload) {
    const redis = ctx.app.redis.use(0);
    await redis.set(
      this._oauthSceneKey(state),
      JSON.stringify(payload),
      "PX",
      OAUTH_SCENE_TTL_MS,
    );
  }

  async pollOAuth(ctx, state) {
    const redis = ctx.app.redis.use(0);
    const raw = await redis.get(this._oauthSceneKey(state));
    if (!raw) return { status: "expired" };
    return JSON.parse(raw);
  }

  _wechatOAuth(ctx) {
    const cfg = this._getProviderConfig("wechat");
    const { appId, appSecret } = cfg || {};
    const redirectUri = this._buildRedirectUri("wechat");
    const redis = ctx.app.redis.use(0);
    return new WechatOAuth({
      appId,
      appSecret,
      redirectUri,
      getItem: async (key) => {
        const raw = await redis.get(`WECHAT_OAUTH:${key}`);
        return raw ? JSON.parse(raw) : null;
      },
      setItem: async (key, value) => {
        await redis.set(
          `WECHAT_OAUTH:${key}`,
          JSON.stringify(value),
          "PX",
          OAUTH_SCENE_TTL_MS,
        );
      },
    });
  }

  async createWechatQrcode(ctx) {
    const cfg = this._getProviderConfig("wechat");
    if (!cfg?.configured) {
      const err = new Error(
        "微信登录未配置，请在 .config.js 的 oauthLogin.wechat 填写开放平台网站应用 appId/appSecret",
      );
      err.status = 503;
      throw err;
    }
    const state = crypto.randomBytes(16).toString("hex");
    await this._initOAuthScene(ctx, state, "wechat");
    const oauth = this._wechatOAuth(ctx);
    const authUrl = oauth.getQrConnectURL(state, "snsapi_login");
    const qr_image = await QRCode.toDataURL(authUrl, { margin: 1, width: 220 });
    return { provider: "wechat", state, auth_url: authUrl, qr_image, expires_in: 300 };
  }

  _getProviderConfig(provider) {
    const cfg = this.config.oauthLogin?.[provider];
    if (!cfg) return null;
    return {
      ...cfg,
      configured: !!(cfg.appId && cfg.appSecret && cfg.thirdType != null),
    };
  }

  _buildRedirectUri(provider) {
    return `${this.config.domain}/api/oauth/${provider}/callback`;
  }

  _buildAuthorizeUrl(provider, state) {
    const cfg = this._getProviderConfig(provider);
    if (!cfg?.configured) {
      const err = new Error(
        `${PROVIDER_NAMES[provider] || provider}登录未配置，请在服务端填写 appId/appSecret`,
      );
      err.status = 503;
      throw err;
    }
    const redirectUri = encodeURIComponent(this._buildRedirectUri(provider));
    if (provider === "weibo" || provider === "qq") {
      return `${cfg.authorizeUrl}?client_id=${cfg.appId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
    }
    if (provider === "alipay") {
      const scope = cfg.scope || "auth_user";
      return `${cfg.authorizeUrl}?app_id=${cfg.appId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
    }
    if (provider === "taobao") {
      return `${cfg.authorizeUrl}?response_type=code&client_id=${cfg.appId}&redirect_uri=${redirectUri}&state=${state}&view=web`;
    }
    const err = new Error("不支持的登录方式");
    err.status = 400;
    throw err;
  }

  /** 支付宝 / 淘宝 / 微博：浏览器跳转授权 */
  async createOAuthRedirect(ctx, provider) {
    const state = crypto.randomBytes(16).toString("hex");
    await this._initOAuthScene(ctx, state, provider);
    const auth_url = this._buildAuthorizeUrl(provider, state);
    return { provider, state, auth_url, expires_in: 300 };
  }

  async startOAuth(ctx, provider) {
    if (provider === "wechat") {
      return this.createWechatQrcode(ctx);
    }
    if (OAUTH_REDIRECT_PROVIDERS.includes(provider)) {
      return this.createOAuthRedirect(ctx, provider);
    }
    const err = new Error("不支持的登录方式");
    err.status = 400;
    throw err;
  }

  _parseQqResponse(text) {
    const trimmed = String(text || "").trim();
    if (trimmed.startsWith("callback(")) {
      return JSON.parse(trimmed.slice(9, trimmed.lastIndexOf(")")));
    }
    const data = {};
    for (const part of trimmed.split("&")) {
      const [k, v] = part.split("=");
      if (k) data[decodeURIComponent(k)] = decodeURIComponent(v || "");
    }
    return data;
  }

  async _exchangeOAuthCode(provider, code) {
    const cfg = this._getProviderConfig(provider);
    if (!cfg?.configured) {
      throw new Error(`${PROVIDER_NAMES[provider]}登录未配置`);
    }
    const redirectUri = this._buildRedirectUri(provider);

    if (provider === "weibo") {
      const body = new URLSearchParams({
        client_id: cfg.appId,
        client_secret: cfg.appSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      });
      const res = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error_description || data.error || "微博授权失败");
      }
      const openid = String(data[cfg.openidField || "uid"] || "");
      return { openid, unionid: data.unionid || null };
    }

    if (provider === "qq") {
      const tokenQuery = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: cfg.appId,
        client_secret: cfg.appSecret,
        code,
        redirect_uri: redirectUri,
        fmt: "json",
      });
      const tokenRes = await fetch(`${cfg.tokenUrl}?${tokenQuery.toString()}`);
      const tokenData = this._parseQqResponse(await tokenRes.text());
      if (tokenData.error || tokenData.code) {
        throw new Error(
          tokenData.error_description || tokenData.msg || "QQ 授权失败",
        );
      }
      const accessToken = tokenData.access_token;
      if (!accessToken) {
        throw new Error("QQ 未返回 access_token");
      }
      const openidRes = await fetch(
        `${cfg.openidUrl || "https://graph.qq.com/oauth2.0/me"}?${new URLSearchParams({
          access_token: accessToken,
          fmt: "json",
        }).toString()}`,
      );
      const openidData = this._parseQqResponse(await openidRes.text());
      if (openidData.error || openidData.code) {
        throw new Error(
          openidData.error_description || openidData.msg || "QQ 获取 openid 失败",
        );
      }
      const openid = String(openidData[cfg.openidField || "openid"] || "");
      return { openid, unionid: null };
    }

    if (provider === "alipay" || provider === "taobao") {
      const err = new Error(
        `${PROVIDER_NAMES[provider]} token 交换需在 oauthLogin 中对接开放平台 SDK，当前请先使用账号或微信登录`,
      );
      err.status = 501;
      throw err;
    }

    throw new Error("不支持的登录方式");
  }

  async _loginByOpenid(ctx, state, provider, openid, generateToken) {
    const cfg = this._getProviderConfig(provider);
    const thirdType = cfg?.thirdType;
    if (thirdType == null) {
      await this._setOAuthScene(ctx, state, {
        status: "error",
        message: "三方登录类型未配置",
      });
      return { ok: false, message: "三方登录类型未配置" };
    }
    const ta = await thirdAuth.findOne({
      where: { openid, type: thirdType, isbind: 1 },
    });
    if (!ta) {
      await this._setOAuthScene(ctx, state, {
        status: "error",
        message: `该${PROVIDER_NAMES[provider] || ""}账号未绑定后台用户，请先用账号密码登录`,
      });
      return { ok: false, message: "三方账号未绑定" };
    }
    const related = await ta.getUsers();
    const user = related?.[0];
    if (!user || !this.isBackendUser(user)) {
      await this._setOAuthScene(ctx, state, {
        status: "error",
        message: "非后台账号，无法登录",
      });
      return { ok: false, message: "非后台账号" };
    }
    const tokens = generateToken(user.dataValues || user, this.config.jwt);
    await this._setOAuthScene(ctx, state, { status: "ok", tokens });
    return { ok: true, message: "登录成功" };
  }

  async _exchangeWechatCode(ctx, code) {
    const oauth = this._wechatOAuth(ctx);
    const tokenRes = await oauth.getAccessToken(code);
    const openid = tokenRes?.openid;
    if (!openid) {
      throw new Error("未获取到微信身份");
    }
    return { openid, unionid: tokenRes?.unionid || null };
  }

  async handleOAuthCallback(ctx, provider, code, state, generateToken) {
    const redis = ctx.app.redis.use(0);
    const expiredMsg =
      provider === "wechat"
        ? "二维码已过期，请刷新重试"
        : "授权已过期，请重新发起登录";
    if (!(await redis.get(this._oauthSceneKey(state)))) {
      return { ok: false, message: expiredMsg };
    }
    if (provider === "wechat") {
      try {
        const { openid } = await this._exchangeWechatCode(ctx, code);
        return this._loginByOpenid(ctx, state, provider, openid, generateToken);
      } catch (e) {
        const message = e.message || "微信授权失败";
        await this._setOAuthScene(ctx, state, { status: "error", message });
        return { ok: false, message };
      }
    }
    try {
      const { openid } = await this._exchangeOAuthCode(provider, code);
      if (!openid) {
        await this._setOAuthScene(ctx, state, {
          status: "error",
          message: "未获取到用户标识",
        });
        return { ok: false, message: "未获取到用户标识" };
      }
      return this._loginByOpenid(ctx, state, provider, openid, generateToken);
    } catch (e) {
      await this._setOAuthScene(ctx, state, {
        status: "error",
        message: e.message || "授权失败",
      });
      return { ok: false, message: e.message || "授权失败" };
    }
  }

}
