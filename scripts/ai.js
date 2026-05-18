/**
 * @Author: colpu
 * @Date: 2026-03-24 16:52:46
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-18 20:55:39
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { db, aiDb, records, classify, template, classifyExtend, rechargePackages } from '../src/models/ai/index.js';

export default async ({ isSync, force }) => {
  console.log('🚀 Starting MySQL data initialization...');
  try {
    // 同步数据库
    await db.initDatabase("colpu_ai", { force });
    console.log("✅ colpu_ai 已连接（表结构请执行: node scripts/migrate.js）");
    await initData(isSync)
  } catch (error) {
    console.error('❌ Data install failed:', error);
  }
};
async function initData(isSync) {
  if (!isSync) return;
  for (const item of (await import('./data/ai/classify.js')).default) {
    await classify.create(item);
  }
  for (const item of (await import('./data/ai/template.js')).default) {
    await template.create(item);
  }
  for (const item of (await import('./data/ai/classify_template.js')).default) {
    const res = await classify.findByPk(item.classify_id);
    await res.addTemplate([item.template_id]);
  }
  for (const item of (await import('./data/ai/classify_extend.js')).default) {
    await classifyExtend.create(item);
  }
  for (const item of (await import('./data/ai/recharge_packages.js')).default) {
    await rechargePackages.upsert(item);
  }
  // 创建客户端
  console.log('🎉 Data install completed successfully!');
}
