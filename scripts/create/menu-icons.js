/**
 * 批量补齐后台菜单 icon（Ant Design 图标名）
 * 用法：node scripts/create/menu-icons.js
 */
import allMenus from "../data/sys/menus.js";
import { menus } from "../../src/models/sys/index.js";

for (const item of allMenus) {
  const icon = item.icon;
  if (!icon) continue;
  const row = await menus.findByPk(item.id);
  if (!row) continue;
  if (row.icon === icon) continue;
  await row.update({ icon });
  console.log(`id=${item.id} ${item.title || item.name} → ${icon}`);
}

console.log("菜单 icon 更新完成，请重新登录后台查看侧边栏。");
