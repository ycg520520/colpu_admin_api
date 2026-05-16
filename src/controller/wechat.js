/**
 * @Author: colpu
 * @Date: 2026-02-13 22:24:11
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-15 21:23:40
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { v4 as uuidv4 } from 'uuid';
// 需要额外的库来生成二维码图片，例如 qrcode
import QRCode from 'qrcode';
import { Controller } from "@colpu/core";
import crypto from "crypto";
import Joi from "joi";
import WechatOAuth from '../utils/wechat/auth.js';
import { verifyPushSignature, decryptMpMessagePlain } from "../utils/wechat/utils.js";

/** 微信消息推送协议回包（不走 ctx.respond 统一包装） */
function replyWxPush(ctx, errCode, errMsg) {
  ctx.type = "application/json; charset=utf-8";
  ctx.body = { ErrCode: errCode, ErrMsg: errMsg };
}

const wechatOAuth = new WechatOAuth({
  // getToken: async () => {
  //   // 从缓存或数据库获取 token
  //   const tokenData = await getTokenFromStore();
  //   if (tokenData && tokenData.isValid()) {
  //     return tokenData;
  //   }
  //   // 如果没有有效的 token，调用微信 API 获取新的 token
  //   const newToken = await fetchNewTokenFromWeChat();
  //   // 存储新 token
  //   await saveTokenToStore(newToken);
  //   return new AccessToken(newToken);
  // },
  // saveToken: async (token) => {
  //   // 将 token 存储到缓存或数据库
  //   await saveTokenToStore(token);
  // }
});
export default class WeChatController extends Controller {
  constructor(ctx) {
    super(ctx);
    const { appId, appSecret, redirectUri } = this.config.wx; // 从配置文件中获取微信配置
    wechatOAuth.setOptions({ appId, appSecret, redirectUri }); // 初始化微信OAuth实例
    this.wechatOAuth = wechatOAuth;
  }
  /**
   *
   * @param {*} ctx
   */
  async getAccessToken(ctx) {
    // 从查询参数中获取 code
    const { code } = ctx.validate({
      query: {
        code: Joi.string(),
      },
    });
    const res = await this.wechatOAuth.getAccessToken(code);
    ctx.respond(res); // 返回获取到的 access_token
  }

  // 微信扫码公众号登录接口适用于PC网站直接呈现二维码
  async qrcode(ctx) {
    const sceneId = uuidv4().replace(/-/g, '');
    const sessionId = ctx.cookies.get('sessionId') || uuidv4();
    ctx.cookies.set('sessionId', sessionId, { httpOnly: false });
    this.wechatOAuth.setItem(sceneId, {
      sessionId,
      expires: 60 * 5 // 5分钟过期
    });
    const qrcodeUrl = await this.wechatOAuth.getQrCodeTicketURL(sceneId); // 获取微信授权URL
    const qrImage = await QRCode.toDataURL(qrcodeUrl); // 生成二维码图片
    // ctx.respond({
    //   authUrl,
    //   state,
    //   qrImage
    // });
    const html = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
        <img src="${qrImage}" alt="微信扫码登录二维码" />
        <p>${sceneId}</p>
      </body>
      </html>`
    ctx.body = html;
    // ctx.respond(html);
  }

  // 微信扫码后的回调接口，微信会携带 code 和 state（即 scene）参数
  async callback(ctx) {
    const { echostr, signature, timestamp, nonce } = ctx.query;
    const { pushToken } = this.config.wx;
    const sortStr = [pushToken, timestamp, nonce].sort().join('');
    const digest = crypto.createHash('sha1').update(sortStr).digest('hex');
    console.log('微信回调参数', ctx.query);
    if (digest === signature) {
      console.log('微信回调验证成功', echostr);
      ctx.type = 'text/plain';
      ctx.body = echostr; // 验证成功，返回 echostr
    } else {
      ctx.status = 403; // 验证失败，返回 403 错误
      ctx.throw("非法请求");
    }
    // // 这里是微信扫码后的回调接口，微信会携带 code 和 state（即 scene）参数
    // const { code, state } = ctx.query;
    // const { pushToken, encodingAESKey } = ctx.config.wx;
    // const cachedState = this.wechatOAuth.getItem(state); // 获取state对应的状态码，验证state是否有效
    // // 1. 验证state是否存在
    // if (!cachedState) {
    //   // ctx.status = 400;
    //   ctx.body = '二维码已过期，请重新扫描';
    //   return;
    // }

    // // 2. 使用code换取 access_token和用户信息
    // const tokenRes = await this.wechatOAuth.getAccessToken(code) // 使用 code 换取 access_token 和用户信息
    // const { access_token, openid, unionid } = tokenRes.data;

    // // 3、通过access_token, openid, unionid 调用微信的API来获取用户信息；
    // const userInfo = { openid: openid, nickname: '微信用户' }; // 伪代码，实际需要调用微信API

    // // 4. 将用户信息保存到数据库，并生成一个唯一的token，用于后续的接口调用验证

    // // 5. 将token返回给前端，前端保存token，后续的接口调用都需要带上这个token
    // ctx.body = { success: true, data: { token: 'your_token', userInfo } };
  }
  /**
   * 统一入口：可同时作为
   * 小程序「消息推送」URL（数据格式 JSON）：虚拟支付 xpay_* 等。
   * Token：与公众平台「消息推送」一致，使用 `config.wx.pushToken`。
   */
  async push(ctx) {
    const { pushToken: token } = this.config.wx || {};
    const query = ctx.query || {};
    if (ctx.method === "GET" && query.echostr != null) {
      if (!verifyPushSignature(query, token)) {
        ctx.status = 403;
        ctx.body = "forbidden";
        return;
      }
      ctx.type = "text/plain; charset=utf-8";
      ctx.body = String(query.echostr);
      return;
    }
    if (ctx.method === "POST") {
      const body = ctx.request.body || {};

      if (body.action === "CheckContainerPath") {
        return replyWxPush(ctx, 0, "success");
      }

      const wxCfg = this.config.wx || {};
      let payload = body;

      const encrypt = body.Encrypt;
      if (encrypt && !wxCfg.encodingAESKey) {
        ctx.status = 403;
        return replyWxPush(ctx, 403, "no_encoding_aes_key");
      }
      if (!verifyPushSignature(query, token, encrypt)) {
        ctx.status = 403;
        return replyWxPush(
          ctx,
          403,
          encrypt ? "invalid msg_signature" : "invalid signature",
        );
      }
      if (encrypt) {
        try {
          const plain = decryptMpMessagePlain({
            encodingAESKey: wxCfg.encodingAESKey,
            encryptBase64: encrypt,
            expectAppId: wxCfg.appId,
          });
          payload = JSON.parse(plain);
        } catch (e) {
          console.error("微信消息推送解密失败", e);
          ctx.status = 403;
          return replyWxPush(ctx, 403, "decrypt_fail");
        }
      }

      const { Event: event, OutTradeNo: out_trade_no } = payload;
      const transaction_id = payload.TransactionId || payload.WxOrderId || null;

      if (
        event !== "xpay_goods_deliver_notify" &&
        event !== "xpay_coin_pay_notify"
      ) {
        return replyWxPush(ctx, 0, "success");
      }

      if (!out_trade_no) {
        console.error("虚拟支付推送缺少 OutTradeNo", payload);
      }
      try {
        const r = await this.service.ai.points.fulfillRechargeByNotify({
          out_trade_no,
          transaction_id,
        });
        if (!r?.ok && r?.reason && r.reason !== "order_not_found") {
          return replyWxPush(ctx, 1, r.reason);
        }
      } catch (e) {
        console.error("virtualPush fulfill error", e);
        return replyWxPush(ctx, 1, "fulfill error");
      }
      return replyWxPush(ctx, 0, "success");
    }
    ctx.status = 405;
  }
}
