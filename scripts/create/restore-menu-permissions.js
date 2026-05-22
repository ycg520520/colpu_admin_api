/**
 * 按种子数据恢复「菜单类」权限的 menu_ids（修复被 ai-menus 误合并的公共菜单等）
 * 用法：node scripts/create/restore-menu-permissions.js
 */
import permSeed from "../data/sys/permissions.js";
import { permissions } from "../../src/models/sys/index.js";

const menuPermSeeds = permSeed.filter((p) => p.type === "menu" && Array.isArray(p.menu_ids));

for (const item of menuPermSeeds) {
  const row = await permissions.findOne({ where: { name: item.name, type: "menu" } });
  if (!row) {
    console.warn(`跳过：未找到菜单权限「${item.name}」`);
    continue;
  }
  await row.update({ menu_ids: item.menu_ids });
  console.log(`已恢复 #${row.id} ${item.name}，menu_ids 共 ${item.menu_ids.length} 项`);
}

console.log("菜单权限 menu_ids 已按种子恢复，请重新登录后台。");
