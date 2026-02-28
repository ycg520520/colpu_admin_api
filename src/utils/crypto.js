/**
 * @Author: colpu
 * @Date: 2023-11-07 22:53:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-22 17:20:07
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import crypto from "crypto";
export default {
  uuid() {
    return crypto.randomUUID();
  },
  /**
   * md5 加密
   * @param {String} input
   */
  md5(input) {
    const hash = crypto.createHash("md5");
    return hash.update(input).digest("hex");
  },

  /**
   * Rsa签名
   * @param {*} str
   * @param {*} privateKey
   * @param {*} signType
   */
  rsaSign(str, privateKey, signType) {
    let sha;
    if (signType === "RSA2") {
      sha = crypto.createSign("RSA-SHA256");
    } else {
      sha = crypto.createSign("RSA-SHA1");
    }
    sha.update(str, "utf8");
    return sha.sign(privateKey, "base64");
  },

  /**
   *  rsa签名校验
   * @param {*} str
   * @param {*} sign
   * @param {*} publicKey
   * @param {*} signType RSA2(RSA-SHA256)/RSA-SHA1
   */
  rsaSignVerify(str, sign, publicKey, signType) {
    let verify;
    if (signType === "RSA2") {
      verify = crypto.createVerify("RSA-SHA256");
    } else {
      verify = crypto.createVerify("RSA-SHA1");
    }
    verify.update(str, "utf8");
    let result = verify.verify(publicKey, sign, "base64");
    return result;
  },

  /**
   * 获取排序后的Object,按属性键值排序
   * @param {Object} obj
   */
  getSortObj(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((r, k) => ((r[k] = obj[k]), r), {});
  },

  /**
   * Object按Keys排序后组成QueryString
   */
  objectToSortQuery(obj, encode = false) {
    let keys = Object.keys(obj);
    let query = [];
    keys.sort();
    for (let i = 0, l = keys.length; i < l; ++i) {
      let p = keys[i];
      let v = obj[p];
      query.push(p + "=" + (encode ? encodeURIComponent(v) : v));
    }
    return query.join("&");
  },

  /**
   * 解密aes
   * @param {String} algorithm 算法，例如:aes-128-cbc
   * @param {String} key 秘钥, utf8|Buffer
   * @param {String} iv  iv, utf8|Buffer
   * @param {String} data 加密的数据 Base64|Buffer
   * @param {String} [inputEncoding=base64] 输入编码 base64|latin1|hex|null,  If the inputEncoding argument is not given, data must be a Buffer
   * @param {String} [outputEncoding=utf8] 输出编码  utf8|latin1|ascii
   * @param {Boolean} [autoPadding=true] autoPadding
   */
  decryptAes(
    algorithm,
    key,
    iv,
    data,
    inputEncoding = "base64",
    outputEncoding = "utf8",
    autoPadding = true
  ) {
    try {
      let decipher = crypto.createDecipheriv(algorithm, key, iv);

      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(autoPadding);
      let decoded = decipher.update(data, inputEncoding, outputEncoding);
      decoded += decipher.final(outputEncoding);

      return decoded;
    } catch (e) {
      console.error("decode token error", e);
      throw e;
    }
  },

  /**
   *
   * @param {String} algorithm 算法，例如:aes-128-cbc
   * @param {String} key 秘钥,utf8|Buffer 字符为16个字符串
   * @param {String} iv  iv,utf8|Buffer
   * @param {String|Buffer} data 需要加密的数据 utf8|Buffer
   * @param {String} [inputEncoding=utf8] 输入编码 utf8|ascii|latin1|null, If the inputEncoding argument is not given, data must be a Buffer
   * @param {String} [outputEncoding=base64] 输出编码  base64|hex|latin1,default:base64
   * @param {Boolean} [autoPadding=true] autoPadding default=true
   */
  encryptAes(
    algorithm,
    key,
    iv,
    data,
    inputEncoding = "utf8",
    outputEncoding = "base64",
    autoPadding = true
  ) {
    try {
      let cipher = crypto.createCipheriv(algorithm, key, iv);

      // 设置自动 padding 为 true，删除填充补位
      cipher.setAutoPadding(autoPadding);
      let encoded = cipher.update(data, inputEncoding, outputEncoding);
      encoded += cipher.final(outputEncoding);

      return encoded;
    } catch (e) {
      console.error("encryptAes error", e);
      throw e;
    }
  },

  /**
   * @function mixAESdata
   * @param {String} data 需要混入的ASE加密数据
   * @param {String} mixin 混入的字符串
   * @param {Number} step 混入的步长
   * @returns
   */
  mixAESdata(data, mixin, step = 1) {
    if (!data || !mixin) {
      return data;
    }
    const len = mixin.length;
    const substr = data.substring(0, len * step);
    const mixed = substr
      .split("")
      .map((item, index) => {
        return item + mixin.substring(index, index + step);
      })
      .join("");
    return data.replace(substr, mixed);
  },

  /**
   * @function shiftMixAESdata
   * @param {String} data 混入的ASE加密数据
   * @param {String} mixin 混入的字符串
   * @param {Number} step 混入的步长
   * @returns
   */
  shiftMixAESdata(data, mixin, step = 1) {
    if (!data || !mixin) {
      return data;
    }
    const len = mixin.length * step * 2;
    const substr = data.substring(0, len);
    if (substr.length < len) {
      throw new Error("需要去除混合数据长度不能少于mixin*step*2");
    }
    const mixed = substr.split("");
    let realStr = "";
    for (let i = 0; i < len; i++) {
      if (i % 2 == 0) {
        realStr += mixed[i];
      }
    }
    return data.replace(substr, realStr);
  },

  encryptAesMix(data, aes) {
    data = this.encryptAes("aes-256-cbc", aes.key, aes.iv, data);
    return this.mixAESdata(data, aes.data);
  },
  decryptAesMix(data, aes) {
    // 去除掉混合字符串
    data = this.shiftMixAESdata(data, aes.data);
    return this.decryptAes("aes-256-cbc", aes.key, aes.iv, data);
  },

  /*
   * 根据一个盐值加密生成随机的字符串
   * @function
   * @param {string} source 要转换的字符串
   */
  sha256(source, salt) {
    const hmac = crypto.createHmac("sha256", "" + salt); // 盐值
    hmac.update("" + source);
    const value = hmac.digest("hex");
    return value;
  },

  hash(input, salt) {
    return crypto.pbkdf2Sync(input, salt, 100000, 64, 'sha512').toString('hex');
  },

  compare(hash, storedHash) {
    return crypto.timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
  }
};
