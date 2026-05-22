/**
 * 从 DEFAULT_AD_CONFIG 写入 ad_slots / app_settings（可重复执行，跳过已存在项）
 * 用法：node scripts/create/ad-config.js
 */
import { adSlots, appSettings } from "../../src/models/ai/index.js";
import {
  DEFAULT_AD_CONFIG,
  DEFAULT_APP_SETTINGS,
} from "../../src/service/ai/ads.js";

async function upsertSetting(key, value, remark) {
  const [row, created] = await appSettings.findOrCreate({
    where: { setting_key: key },
    defaults: { setting_key: key, setting_value: value, remark },
  });
  if (!created) {
    console.log(`跳过设置 ${key}（已存在）`);
    return;
  }
  console.log(`已写入设置 ${key}=${value}`);
}

async function seedSplash() {
  const exists = await adSlots.findOne({
    where: { slot_type: "splash", status: 1 },
  });
  if (exists) {
    console.log("跳过 splash（已存在）");
    return;
  }
  const s = DEFAULT_AD_CONFIG.splash;
  await adSlots.create({
    slot_type: "splash",
    sort_order: 0,
    status: 1,
    enabled: s.enabled ? 1 : 0,
    unit_id: s.unitId || "",
    src: s.src,
    href: s.href,
  });
  console.log("已创建 splash 广告位");
}

async function seedByType(slotType, items, mapRow) {
  const count = await adSlots.count({
    where: { slot_type: slotType, status: 1 },
  });
  if (count >= items.length) {
    console.log(`跳过 ${slotType}（已有 ${count} 条）`);
    return;
  }
  for (let i = count; i < items.length; i++) {
    const item = items[i];
    await adSlots.create(mapRow(item, items.length - i));
    console.log(`已创建 ${slotType} #${i + 1}`);
  }
}

await upsertSetting(
  "splash_countdown",
  DEFAULT_AD_CONFIG.splash_countdown ?? DEFAULT_APP_SETTINGS.splash_countdown,
  "开屏倒计时（秒）",
);
await upsertSetting(
  "default_point",
  DEFAULT_APP_SETTINGS.default_point,
  "每次生成默认扣点（展示用，实际以分类配置为准）",
);
await seedSplash();
await seedByType("custom", DEFAULT_AD_CONFIG.custom || [], (item, sort) => ({
  slot_type: "custom",
  sort_order: sort,
  status: 1,
  unit_id: item.unitId || "",
  ad_intervals: item.adIntervals ?? 30,
}));
await seedByType("list", DEFAULT_AD_CONFIG.list || [], (item, sort) => ({
  slot_type: "list",
  sort_order: sort,
  status: 1,
  unit_id: item.unitId || "",
  src: item.src,
  href: item.href,
  title: item.title,
  disabled: item.disabled ? 1 : 0,
}));

console.log("广告配置种子完成");
