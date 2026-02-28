/**
 * @Author: colpu
 * @Date: 2025-12-15 16:24:35
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-11 23:27:56
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { db, classify, spider, frags, articles, sites } from '../src/models/cms/index.js';
export default async () => {
  console.log('🚀 Starting MySQL data initialization...');
  try {
    // 同步数据库
    await db.initDatabase('colpucms'); // 初始数据库
    console.log('✅ Database synchronized');
    // 创建分类
    for (const item of (await import('./data/cms/classify.js')).default) {
      await classify.create(item);
    }
    console.log('✅ Created classify completed');
    // 创建爬虫
    const spiderData = (await import('./data/cms/spider.js')).default;
    spider.bulkCreate(spiderData);
    console.log('✅ Created spider completed');

    // 创建碎片
    const fragsData = (await import('./data/cms/frags.js')).default;
    frags.bulkCreate(fragsData);
    console.log('✅ Created frags completed');

    const articleData = (await import('./data/cms/articles.js')).default;
    articles.bulkCreate(articleData);
    console.log('✅ Created articles completed');

    const siteData = (await import('./data/cms/sites.js')).default;
    sites.bulkCreate(siteData);
    console.log('✅ Created sites completed');


    // 创建客户端
    console.log('🎉 Data install completed successfully!');
  } catch (error) {
    console.error('❌ Data install failed:', error);
  }
};
