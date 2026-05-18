/**
 * colpu_ai 库结构：仅通过本文件注册的 Umzug 迁移维护（不使用 sequelize.sync）。
 * 新建库：先保证库存在 → `node scripts/migrate.js`（含 classify/records 与积分充值相关表）→ 再跑 `scripts/ai.js` 等灌数脚本。
 */
import { Umzug, SequelizeStorage } from "umzug";
import { aiDb } from "../src/models/ai/index.js";
import colpuAiSchema from "./migrations/indian/colpu_ai_schema.js";
import colpuAiPointsRecharge from "./migrations/indian/colpu_ai_points_recharge.js";
import colpuAiPointLogsUserIdToUid from "./migrations/indian/colpu_ai_point_logs_user_id_to_uid.js";
import colpuAiPackageInvite from "./migrations/indian/colpu_ai_package_invite.js";
import colpuAiInviteRenameTables from "./migrations/indian/colpu_ai_invite_rename_tables.js";

const umzug = new Umzug({
  migrations: [
    colpuAiSchema,
    colpuAiPointsRecharge,
    colpuAiPointLogsUserIdToUid,
    colpuAiPackageInvite,
    colpuAiInviteRenameTables,
  ],
  context: aiDb.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: aiDb }),
});
await umzug.up();
