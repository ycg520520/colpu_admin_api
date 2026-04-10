/**
 * @Author: colpu
 * @Date: 2025-10-28 22:06:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-27 11:10:39
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import DbInstances from "../../utils/db/index.js";
export const db = DbInstances.mysql;
export const cmsDb = db.use("colpu_cms");

// 分类表
export const classify = (await import("./classify.js")).default(cmsDb);

export const articles = (await import("./articles.js")).default(cmsDb);
export const articleTags = (await import("./article_tags.js")).default(cmsDb);
export const tags = (await import("./tags.js")).default(cmsDb);
articles.belongsToMany(tags, {
  through: articleTags,
  foreignKey: 'article_id',
  otherKey: 'tag_id',
});

export const slider = (await import("./slider.js")).default(cmsDb);
export const sites = (await import("./sites.js")).default(cmsDb);
export const messages = (await import("./messages.js")).default(cmsDb);
export const friendLink = (await import("./friend_link.js")).default(cmsDb);
export const notice = (await import("./notice.js")).default(cmsDb);
export const frags = (await import("./frags.js")).default(cmsDb);
export const spider = (await import("./spider.js")).default(cmsDb);
