/**
 * 为已有 colpu_sys 库同步 AI 运营菜单（含按钮权限 menu_type=2），并合并到菜单类权限的 menu_ids。
 * 用法：node scripts/create/ai-menus.js
 *
 * 注意：勿合并到「公共菜单」(id=5)，避免污染公共角色权限。
 */
import allMenus from "../data/sys/menus.js";
import { AI_MENU_IDS } from "../data/sys/ai_menu_ids.js";
import { menus, permissions } from "../../src/models/sys/index.js";

/** 3=全部菜单 7=普通管理员；另按名称合并「AI运营菜单」 */
const PERM_IDS_TO_MERGE = [3, 7];
const PERM_NAMES_TO_MERGE = ["AI运营菜单"];

const aiMenus = allMenus.filter((m) => AI_MENU_IDS.includes(m.id));

function mergeMenuIds(current, extra) {
  let cur = current;
  if (typeof cur === "string") {
    try {
      cur = JSON.parse(cur);
    } catch {
      cur = [];
    }
  }
  if (!Array.isArray(cur)) cur = [];
  return [...new Set([...cur, ...extra])];
}

/** 目录菜单需显式清空 lazy；index 勿与 sort_order 混用 */
function normalizeMenuPayload(item) {
  const payload = { ...item };
  if (payload.menu_type === 0) {
    payload.lazy = null;
    if (payload.index === undefined) payload.index = 0;
    if (payload.hide_child_in_menu === undefined) payload.hide_child_in_menu = 0;
  }
  if (payload.menu_type === 1 && payload.index === undefined) {
    payload.index = 0;
  }
  return payload;
}

for (const item of aiMenus) {
  const payload = normalizeMenuPayload(item);
  const [row, created] = await menus.findOrCreate({
    where: { id: item.id },
    defaults: payload,
  });
  if (!created) {
    await row.update(payload);
    console.log(`更新菜单 id=${item.id} ${item.title || item.perm_code}`);
  } else {
    console.log(`新建菜单 id=${item.id} ${item.title || item.perm_code}`);
  }
}

for (const permId of PERM_IDS_TO_MERGE) {
  const perm = await permissions.findByPk(permId);
  if (!perm || perm.type !== "menu") continue;
  const next = mergeMenuIds(perm.menu_ids, AI_MENU_IDS);
  await perm.update({ menu_ids: next });
  console.log(`权限 #${permId} ${perm.name} 已合并 AI menu_ids`);
}

for (const name of PERM_NAMES_TO_MERGE) {
  const perm = await permissions.findOne({ where: { name, type: "menu" } });
  if (!perm) {
    const [, wasCreated] = await permissions.findOrCreate({
      where: { name, type: "menu" },
      defaults: {
        name,
        type: "menu",
        menu_ids: [...AI_MENU_IDS],
        remark: "仅 AI 运营模块（含按钮权限）",
      },
    });
    console.log(
      wasCreated
        ? `新建权限「${name}」menu_ids=${AI_MENU_IDS.length} 项`
        : `权限「${name}」已存在`,
    );
    continue;
  }
  await perm.update({ menu_ids: [...AI_MENU_IDS] });
  console.log(`权限「${name}」已设为完整 AI menu_ids（${AI_MENU_IDS.length} 项）`);
}

console.log("AI 菜单与权限种子完成。请重新登录后台刷新权限。");
