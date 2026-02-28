/**
 * @Author: colpu
 * @Date: 2025-10-28 22:06:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-12 14:12:03
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import DbInstances from "../../utils/db/index.js";
export const db = DbInstances.mysql;
export const cmsdb = db.use("colpucms");

// 分类表
export const classify = (await import("./classify.js")).default(cmsdb);

export const articles = (await import("./articles.js")).default(cmsdb);
export const articleTags = (await import("./article_tags.js")).default(cmsdb);
export const tags = (await import("./tags.js")).default(cmsdb);
articles.belongsToMany(tags, {
  through: articleTags,
  foreignKey: 'article_id',
  otherKey: 'tag_id',
});

export const slider = (await import("./slider.js")).default(cmsdb);
export const sites = (await import("./sites.js")).default(cmsdb);
export const messages = (await import("./messages.js")).default(cmsdb);
export const friendLink = (await import("./friend_link.js")).default(cmsdb);
export const notice = (await import("./notice.js")).default(cmsdb);
export const frags = (await import("./frags.js")).default(cmsdb);
export const spider = (await import("./spider.js")).default(cmsdb);
