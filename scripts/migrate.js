/**
 * colpu_ai 库结构：仅通过本文件注册的 Umzug 迁移维护（不使用 sequelize.sync）。
 * 新建库：先保证库存在 → `node scripts/migrate.js` → 再跑 `scripts/ai.js` 等灌数脚本。
 */
import { Umzug, SequelizeStorage } from "umzug";
import { aiDb } from "../src/models/ai/index.js";
import colpuAiSchema from "./migrations/indian/colpu_ai_schema.js";

const umzug = new Umzug({
  migrations: [colpuAiSchema],
  context: aiDb.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: aiDb }),
});
await umzug.up();
