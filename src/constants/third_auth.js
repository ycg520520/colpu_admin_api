/**
 * third_auth.type 与 .config.js oauthLogin.*.thirdType 保持一致
 * 1 微信 2 QQ 3 微博 4 支付宝 5 淘宝
 */
export const THIRD_AUTH_TYPE = {
  WECHAT: 1,
  QQ: 2,
  WEIBO: 3,
  ALIPAY: 4,
  TAOBAO: 5,
};

export const THIRD_AUTH_TYPE_NAME = {
  0: "未知",
  [THIRD_AUTH_TYPE.WECHAT]: "微信",
  [THIRD_AUTH_TYPE.QQ]: "QQ",
  [THIRD_AUTH_TYPE.WEIBO]: "微博",
  [THIRD_AUTH_TYPE.ALIPAY]: "支付宝",
  [THIRD_AUTH_TYPE.TAOBAO]: "淘宝",
};
