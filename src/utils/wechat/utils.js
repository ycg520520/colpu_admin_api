/**
 * @Author: colpu
 * @Date: 2026-05-15 15:55:41
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-15 16:00:45
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * 微信公众平台消息推送：签名校验 + 安全模式解密
 * @see https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push.html
 */
import crypto from "crypto";

function sha1Hex(str) {
  return crypto.createHash("sha1").update(str, "utf8").digest("hex");
}

/**
 * 验签（明文 / GET 校验 / 安全模式 POST）
 * - 无 encrypt：比对 query.signature，参与排序 [token, timestamp, nonce]
 * - 有 encrypt：比对 query.msg_signature，参与排序 [token, timestamp, nonce, encrypt]
 */
export function verifyPushSignature(query, token, encrypt) {
  if (!token) return false;
  const timestamp = query?.timestamp;
  const nonce = query?.nonce;
  if (timestamp == null || timestamp === "" || nonce == null || nonce === "") {
    return false;
  }

  const parts = [token, String(timestamp), String(nonce)];
  let expected;

  if (encrypt != null && encrypt !== "") {
    expected = query?.msg_signature;
    if (!expected) return false;
    parts.push(String(encrypt));
  } else {
    expected = query?.signature;
    if (!expected) return false;
  }

  parts.sort();
  return sha1Hex(parts.join("")) === expected;
}

/**
 * 安全模式：解密包体 Encrypt，得到明文 JSON 字符串
 */
export function decryptMpMessagePlain({ encodingAESKey, encryptBase64, expectAppId }) {
  const key = Buffer.from(
    String(encodingAESKey).endsWith("=")
      ? encodingAESKey
      : `${encodingAESKey}=`,
    "base64",
  );
  if (key.length !== 32) {
    throw new Error("EncodingAESKey 解码后须为 32 字节");
  }
  const iv = key.slice(0, 16);
  const buf = Buffer.from(String(encryptBase64), "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([decipher.update(buf), decipher.final()]);
  if (decrypted.length < 20) {
    throw new Error("解密结果过短");
  }
  const msgLen = decrypted.readUInt32BE(16);
  const end = 20 + msgLen;
  if (end > decrypted.length) {
    throw new Error("消息长度字段非法");
  }
  const plain = decrypted.slice(20, end).toString("utf8");
  if (expectAppId) {
    const tail = decrypted.slice(end).toString("utf8");
    if (tail !== String(expectAppId)) {
      throw new Error(`解密尾部 appid 与配置不一致（${tail} vs ${expectAppId}）`);
    }
  }
  return plain;
}

/**
 * 微信消息推送协议回包消息体
 */
export function replyWxPush(ctx, errCode, errMsg) {
  ctx.type = "application/json; charset=utf-8";
  ctx.body = { ErrCode: errCode, ErrMsg: errMsg };
}
