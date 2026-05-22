/**
 * 同步「例子」模块菜单结构调整（id 5–15 相关项）
 * 用法：node scripts/create/sync-example-menus.js
 */
import allMenus from "../data/sys/menus.js";
import { menus } from "../../src/models/sys/index.js";

const EXAMPLE_MENU_IDS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const items = allMenus.filter((m) => EXAMPLE_MENU_IDS.includes(m.id));

for (const item of items) {
  const payload = { ...item };
  if (payload.menu_type === 1 && payload.parent_id === 5 && payload.id === 14) {
    payload.layout = null;
  }
  const [row, created] = await menus.findOrCreate({
    where: { id: item.id },
    defaults: payload,
  });
  if (!created) {
    await row.update(payload);
    console.log(`更新菜单 id=${item.id} ${item.title}`);
  } else {
    console.log(`新建菜单 id=${item.id} ${item.title}`);
  }
}

console.log("例子模块菜单同步完成。请重新登录后台刷新菜单。");
