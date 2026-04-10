/**
 * @Author: colpu
 * @Date: 2026-03-24 16:52:46
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-09 10:42:37
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { db, aiDb, recods } from '../src/models/ai/index.js';
export default async ({isSync, force}) => {
  console.log('🚀 Starting MySQL data initialization...');
  try {
    // 同步数据库
    await db.initDatabase('colpu_ai', { force }); // 初始数据库
    console.log('✅ Database synchronized');
    // await initData(isSync)
  } catch (error) {
    console.error('❌ Data install failed:', error);
  }
};
async function initData(isSync) {
  if (!isSync) return;
  // 创建客户端
  console.log('🎉 Data install completed successfully!');
}
