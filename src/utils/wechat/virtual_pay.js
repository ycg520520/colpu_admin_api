/**
 * 小程序虚拟支付（米大师）：签名与 code2session
 * @see https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestVirtualPayment.html
 */
import crypto from "crypto";
import axios from "axios";

const VIRTUAL_PAY_URI = "requestVirtualPayment";

/**
 * signData 键名须与微信文档一致（如 outTradeNo，非 tradeNo）。
 * 业务库字段为 recharge_orders.out_trade_no，取值相同。
 */
/** 道具直购 signData 字段顺序（与官方 wx.requestVirtualPayment 示例一致） */
const GOODS_SIGN_FIELD_ORDER = [
  "offerId",
  "buyQuantity",
  "env",
  "currencyType",
  "productId",
  "goodsPrice",
  "activitySellingPrice",
  "outTradeNo",
  "attach",
];

/** 代币充值 signData 字段顺序 */
const COIN_SIGN_FIELD_ORDER = [
  "offerId",
  "buyQuantity",
  "env",
  "currencyType",
  "outTradeNo",
  "attach",
];

function pickSignField(obj, key) {
  const v = obj[key];
  if (v == null || v === "") return undefined;
  if (key === "offerId" || key === "productId" || key === "outTradeNo" || key === "attach") {
    return String(v);
  }
  return v;
}

/**
 * 按微信文档示例顺序序列化 signData（勿字典序；前端须原样传入该字符串）
 */
export function stringifyVirtualSignData(obj, mode = "short_series_goods") {
  const order =
    mode === "short_series_coin" ? COIN_SIGN_FIELD_ORDER : GOODS_SIGN_FIELD_ORDER;
  const sorted = {};
  for (const key of order) {
    const v = pickSignField(obj, key);
    if (v !== undefined) sorted[key] = v;
  }
  return JSON.stringify(sorted);
}

/**
 * env 0 现网用 appKey，env 1 沙箱用 appKeySandbox（须与 signData.env 一致）
 */
export function resolveVirtualAppKey(virtual, env = 0) {
  const v = virtual || {};
  const useSandbox = Number(env) === 1;
  return useSandbox && v.appKeySandbox ? v.appKeySandbox : v.appKey;
}

export function hmacSha256Hex(key, message) {
  const k = typeof key === "string" ? key : String(key ?? "");
  const m = typeof message === "string" ? message : String(message ?? "");
  return crypto.createHmac("sha256", k).update(m, "utf8").digest("hex");
}

/**
 * @param {object} opts
 * @param {string} opts.uri 固定为 requestVirtualPayment
 * @param {string} opts.signData JSON 字符串（与前端传入 wx.requestVirtualPayment 的 signData 完全一致）
 * @param {string} opts.sessionKey code2session 返回的 session_key
 * @param {string} opts.appKey 小程序后台「虚拟支付」现网/沙箱 AppKey
 */
export function virtualPaymentSigns({ uri = VIRTUAL_PAY_URI, signData, sessionKey, appKey }) {
  if (!appKey || !sessionKey || !signData) {
    throw Object.assign(new Error("虚拟支付签名缺少 appKey/session_key/signData"), { status: 503 });
  }
  const paySig = hmacSha256Hex(appKey, `${uri}&${signData}`);
  const signature = hmacSha256Hex(sessionKey, signData);
  return { paySig, signature };
}

export async function jsCode2Session(appid, secret, js_code) {
  const { data } = await axios.get("https://api.weixin.qq.com/sns/jscode2session", {
    params: {
      appid,
      secret,
      js_code,
      grant_type: "authorization_code",
    },
    timeout: 10000,
  });
  if (data.errcode) {
    const err = new Error(data.errmsg || "code2session 失败");
    err.status = 400;
    throw err;
  }
  if (!data.session_key) {
    const err = new Error("未获取到 session_key");
    err.status = 400;
    throw err;
  }
  return data;
}
