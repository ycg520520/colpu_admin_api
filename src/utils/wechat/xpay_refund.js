/**
 * 小程序虚拟支付（米大师）服务端 xpay：query_order / refund_order 的 pay_sig 与请求
 * @see https://developers.weixin.qq.com/miniprogram/dev/server/API/VirtualPayment/api_refund_order.html
 */
import axios from "axios";
import { hmacSha256Hex } from "./virtual_pay.js";

const API_BASE = "https://api.weixin.qq.com";
const PATH_QUERY_ORDER = "/xpay/query_order";
const PATH_REFUND_ORDER = "/xpay/refund_order";

/**
 * 支付签名：pay_sig = HMAC-SHA256(hex)(appKey, path + "&" + postBodyString)
 * postBodyString 须与实际 POST JSON 字节一致（建议固定字段插入顺序）。
 */
export function xpayPaySig(path, postBodyString, appKey) {
  if (!appKey || !path || postBodyString == null) {
    throw Object.assign(new Error("xpay pay_sig 缺少 appKey/path/body"), { status: 503 });
  }
  return hmacSha256Hex(appKey, `${path}&${postBodyString}`);
}

async function postXpay(path, { accessToken, appKey, bodyStr }) {
  const pay_sig = xpayPaySig(path, bodyStr, appKey);
  const url = `${API_BASE}${path}?access_token=${encodeURIComponent(accessToken)}&pay_sig=${pay_sig}`;
  const { data } = await axios.post(url, bodyStr, {
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });
  return data;
}

/** 稳定版 access_token（小程序 appid + secret） */
export async function fetchClientCredentialToken(appId, appSecret) {
  const { data } = await axios.get(`${API_BASE}/cgi-bin/token`, {
    params: {
      grant_type: "client_credential",
      appid: appId,
      secret: appSecret,
    },
    timeout: 15000,
  });
  if (data.errcode) {
    const err = new Error(data.errmsg || "获取 access_token 失败");
    err.status = 503;
    throw err;
  }
  return data.access_token;
}

/**
 * @returns {Promise<object>} 微信返回体（含 errcode、order.left_fee 等）
 */
export async function xpayQueryOrder({
  accessToken,
  appKey,
  openid,
  env,
  outTradeNo,
  wxOrderId,
}) {
  const body = {};
  body.openid = String(openid);
  body.env = Number(env) || 0;
  if (wxOrderId) body.wx_order_id = String(wxOrderId);
  else body.order_id = String(outTradeNo);
  const bodyStr = JSON.stringify(body);
  return postXpay(PATH_QUERY_ORDER, { accessToken, appKey, bodyStr });
}

export async function xpayRefundOrder({
  accessToken,
  appKey,
  openid,
  env,
  outTradeNo,
  wxOrderId,
  refundOrderId,
  leftFee,
  refundFee,
  bizMeta,
  refundReason,
  reqFrom,
}) {
  /** 字段顺序与官方文档一致，避免 pay_sig 校验失败 */
  const body = {};
  body.openid = String(openid);
  if (wxOrderId) body.wx_order_id = String(wxOrderId);
  else body.order_id = String(outTradeNo);
  body.refund_order_id = String(refundOrderId);
  body.left_fee = Number(leftFee);
  body.refund_fee = Number(refundFee);
  body.biz_meta = bizMeta != null ? String(bizMeta) : "";
  body.refund_reason = String(refundReason ?? "5");
  body.req_from = String(reqFrom ?? "3");
  body.env = Number(env) || 0;
  const bodyStr = JSON.stringify(body);
  return postXpay(PATH_REFUND_ORDER, { accessToken, appKey, bodyStr });
}
