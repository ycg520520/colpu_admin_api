/**
 * @Author: colpu
 * @Date: 2023-02-08 20:39:24
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-27 13:32:08
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
// 引入静态资源映射中间件
import koaStatic from 'koa-static';
import fse from "fs-extra"; // 文件操作
import { join } from "path"; // 文件操作
export default (app) => {
  const {
    config,
    env,
    root,
  } = app;
  const assets = join(root, 'assets');
  app.use(
    koaStatic(assets, Object.assign({
    }, config.static && config.static.options)));

  // 做上传目录处理
  const uploadConf = config.upload || {}
  const dir = uploadConf.dir || 'uploads';
  const UPLOAD_DIR = join(assets, dir);
  const TEMP_DIR = join(UPLOAD_DIR, uploadConf.temp || '.temp');
  // const TEMP_DIR = os.tmpdir(); // 使用系统临时目录
  // 保存到 app.config.upload 供其他地方使用
  config.upload = {
    dir,
    fullDir: UPLOAD_DIR,
    temp: TEMP_DIR
  }
  // 确保目录存在
  fse.ensureDirSync(UPLOAD_DIR);
  fse.ensureDirSync(TEMP_DIR);
};
