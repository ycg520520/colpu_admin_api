/**
 * @Author: colpu
 * @Date: 2025-12-19 12:00:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-27 13:26:06
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import verify from "../decorator/verify.js";
import uploadMulter, { koaBusboy } from "../utils/upload.js";
export default (app) => {
  const { controller, router, root, config } = app;
  const upload = controller.upload;
  const uploadConf = config.upload || {}
  // 单文件上传
  router.post("/upload/single", verify, uploadMulter(uploadConf.temp).single('file'), upload.single);
  // 多文件上传
  router.post("/upload/multiple", verify, uploadMulter(uploadConf.temp).array('files', 5), upload.multiple);
  // 删除文件
  router.del("/upload", verify, upload.delete);
  router.get("/upload/list", verify, upload.list);

  const uploadMiddleware = koaBusboy({ isMd5filename: true, dir: uploadConf.dir });
  router.post("/upload/sse", uploadMiddleware);
  router.get("/upload/sse", uploadMiddleware);
};
