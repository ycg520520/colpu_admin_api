/**
 * @Author: colpu
 * @Date: 2025-10-28 22:06:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-15 23:52:06
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import DbInstances from "../../utils/db/index.js";
export const db = DbInstances.mysql;
export const aiDb = db.use("colpu_ai");

export const pointLogs = (await import("./point_logs.js")).default(aiDb);
export const rechargeOrders = (await import("./recharge_orders.js")).default(aiDb);
export const rechargePackages = (await import("./recharge_packages.js")).default(aiDb);
export const inviteCampaigns = (await import("./invite_campaigns.js")).default(aiDb);
export const inviteJoins = (await import("./invite_joins.js")).default(aiDb);

// 记录修复记录
export const records = (await import("./records.js")).default(aiDb);
export const recordPayloads = (await import("./record_payloads.js")).default(aiDb);
export const template = (await import("./template.js")).default(aiDb);
export const classify = (await import("./classify.js")).default(aiDb);
export const classifyTemplate = (await import("./classify_template.js")).default(aiDb);
export const classifyExtend = (await import("./classify_extend.js")).default(aiDb);
export const adSlots = (await import("./ad_slots.js")).default(aiDb);
export const appSettings = (await import("./app_settings.js")).default(aiDb);
// 分类模板关联关系
classify.belongsToMany(template, {
  through: classifyTemplate,
  foreignKey: 'classify_id',
  otherKey: 'template_id',
});
template.belongsToMany(classify, {
  through: classifyTemplate,
  foreignKey: 'template_id',
  otherKey: 'classify_id',
});

// 建立关联关系
classifyExtend.belongsTo(classify, {
  foreignKey: 'classify_id',
  targetKey: 'id',
  as: 'c'
});

records.hasOne(recordPayloads, {
  foreignKey: "record_id",
  sourceKey: "id",
  as: "payload",
});
recordPayloads.belongsTo(records, {
  foreignKey: "record_id",
  targetKey: "id",
  as: "record",
});
