/**
 * @Author: colpu
 * @Date: 2026-05-19 00:25:43
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-25 09:13:09
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * colpu_ai 库结构：仅通过本文件注册的 Umzug 迁移维护（不使用 sequelize.sync）。
 *
 * 用法：
 *   node scripts/migrate.js
 *   node scripts/migrate.js --only=recharge_orders_meta
 *
 * 若曾用旧迁移名（colpu_ai_*）已执行过，需先同步 SequelizeMeta：
 *   UPDATE SequelizeMeta SET name='schema' WHERE name='colpu_ai_schema';
 *   UPDATE SequelizeMeta SET name='recharge_orders_meta' WHERE name='colpu_ai_recharge_orders_meta';
 *   UPDATE SequelizeMeta SET name='ad_config' WHERE name='colpu_ai_ad_config';
 */
import { Umzug, SequelizeStorage } from "umzug";
import { aiDb } from "../src/models/ai/index.js";
import schema from "./migrations/schema.js";
import rechargeOrdersMeta from "./migrations/recharge_orders_meta.js";
import adConfig from "./migrations/ad_config.js";

const allMigrations = [schema, rechargeOrdersMeta, adConfig];

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const downArg = process.argv.find((a) => a.startsWith("--down"));
const onlyName = onlyArg?.slice("--only=".length);
const migrations = onlyName
  ? allMigrations.filter((m) => m.name === onlyName)
  : allMigrations;

if (onlyName && migrations.length === 0) {
  console.error(`未找到迁移: ${onlyName}`);
  console.error("可选:", allMigrations.map((m) => m.name).join(", "));
  process.exit(1);
}

const umzug = new Umzug({
  migrations,
  context: aiDb.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: aiDb }),
});

const pending = await umzug.pending();
if (pending.length) {
  console.log(
    "待执行迁移:",
    pending.map((m) => m.name).join(", "),
  );
} else {
  console.log("无待执行迁移");
}

if (pending.length) {
  await umzug.up();
}
const executed = await umzug.executed()
if (downArg && executed.length) {
  await umzug.down();
}
console.log("colpu_ai 迁移完成");
