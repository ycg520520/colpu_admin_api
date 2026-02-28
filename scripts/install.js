/**
 * @Author: colpu
 * @Date: 2025-10-28 22:05:14
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 16:49:39
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import sysData from './sys.js';
import cmsData from './cms.js';
if (process.argv[1] === import.meta.url.replace('file:\/\/', '')) {
  await sysData();
  await cmsData();
}
