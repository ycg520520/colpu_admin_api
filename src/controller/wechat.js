/**
 * @Author: colpu
 * @Date: 2026-02-13 22:24:11
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-19 12:27:54
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { v4 as uuidv4 } from 'uuid';
// 需要额外的库来生成二维码图片，例如 qrcode
import QRCode from 'qrcode';
import { Controller } from "@colpu/core";
import crypto from "crypto";
import Joi from "joi";
import WechatOAuth from '../utils/wechat_oauth.js';
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
})
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
    const { code } = ctx.validateAsync({
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
}
