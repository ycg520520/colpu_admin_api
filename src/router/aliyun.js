/**
 * @Author: colpu
 * @Date: 2025-10-31 21:06:25
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-29 18:24:20
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const oss = controller.oss;
  // aliyun 获取上传签名（直传方式）
  router.get(`/aliyun/signature`, verify, oss.sts.signature);
  // aliyun 获取STS上传凭证
  router.get(`/aliyun/ststoken`, verify, oss.sts.assumeRole);
  // aliyun 获取STS上传凭证
  router.get(`/aliyun/setupcors`, oss.sts.setupOSSCORS);
  // aliyun 文本鉴黄
  router.post(`/aliyun/scantext`, verify, oss.scan.text);
  // aliyun 图片鉴黄
  router.post(`/aliyun/scanimage`, verify, oss.scan.image);
};
