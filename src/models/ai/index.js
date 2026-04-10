/**
 * @Author: colpu
 * @Date: 2025-10-28 22:06:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-30 12:10:07
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import DbInstances from "../../utils/db/index.js";
export const db = DbInstances.mysql;
export const aiDb = db.use("colpu_ai");

// 记录修复记录
export const recods = (await import("./recods.js")).default(aiDb);
