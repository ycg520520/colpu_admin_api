/**
 * @Author: colpu
 * @Date: 2025-10-31 21:06:25
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-26 14:39:12
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
export default (app) => {
  const { controller, router } = app;
  const ali = controller.ali;
  // aliyun 获取上传签名（直传方式）
  router.get(`/aliyun/signature`, verify, ali.sts.signature);
  // aliyun 获取STS上传凭证
  router.get(`/aliyun/ststoken`, verify, ali.sts.assumeRole);
  // aliyun 获取STS上传凭证
  router.get(`/aliyun/setupcors`, ali.sts.setupOSSCORS);
  // aliyun 文本鉴黄
  router.post(`/aliyun/scantext`, verify, ali.scan.text);
  // aliyun 图片鉴黄
  router.post(`/aliyun/scanimage`, verify, ali.scan.image);
};
