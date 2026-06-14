import crypto from "crypto";

/**
 * Liblib 开放平台 URL 签名（HMAC-SHA1，与官方文档一致）
 * @param {string} uri - API 路径，如 /api/generate/comfyui/app
 * @param {string} secretKey
 */
export function makeLiblibSign(uri, secretKey) {
  const timestamp = String(Date.now());
  const signatureNonce = crypto.randomUUID();
  const content = `${uri}&${timestamp}&${signatureNonce}`;
  const digest = crypto.createHmac("sha1", secretKey).update(content).digest();
  const signature = digest
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return { Signature: signature, Timestamp: timestamp, SignatureNonce: signatureNonce };
}

/**
 * @param {string} baseUrl
 * @param {string} uri
 * @param {string} accessKey
 * @param {string} secretKey
 */
export function buildSignedUrl(baseUrl, uri, accessKey, secretKey) {
  const auth = makeLiblibSign(uri, secretKey);
  const u = new URL(`${String(baseUrl).replace(/\/$/, "")}${uri}`);
  u.searchParams.set("AccessKey", accessKey);
  u.searchParams.set("Signature", auth.Signature);
  u.searchParams.set("Timestamp", auth.Timestamp);
  u.searchParams.set("SignatureNonce", auth.SignatureNonce);
  return u.toString();
}
