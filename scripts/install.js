/**
 * @Author: colpu
 * @Date: 2025-10-28 22:05:14
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-09 10:42:46
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import sysData from './sys.js';
import cmsData from './cms.js';
import aiData from './ai.js';
const isSync = process.env.SYNC_DTAT === "true";
const force = process.env.DB_FORCE === "true";
if (process.argv[1] === import.meta.url.replace('file:\/\/', '')) {
  console.log("isSync", isSync);
  await sysData({ isSync, force });
  await cmsData({ isSync, force });
  await aiData({ isSync, force });
}
