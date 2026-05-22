/**
 * 小程序广告配置（DB + 默认兜底）
 */
import Base from "../base.js";
import { adSlots, appSettings } from "../../models/ai/index.js";

/** 与 controller/ai/index.js 原 AD_CONFIG 一致，用于空库兜底与种子 */
export const DEFAULT_AD_CONFIG = {
  splash: {
    enabled: false,
    unitId: "",
    src: "static/flash/flash2.webp",
    href: "https://www.bailian-ai.com/flash",
  },
  splash_countdown: 5,
  custom: [
    { unitId: "", adIntervals: 30 },
    { unitId: "", adIntervals: 30 },
  ],
  list: [
    {
      src: "static/ad/colorize.png",
      href: "pages/upload/index?id=18",
      title: "黑白上色",
    },
    {
      src: "static/ad/image_video.png",
      href: "pages/upload/index?id=15",
      title: "照片转视频",
      disabled: true,
    },
  ],
};

export const DEFAULT_APP_SETTINGS = {
  splash_countdown: 5,
  default_point: 15,
};

const SETTING_KEYS = Object.keys(DEFAULT_APP_SETTINGS);

function rowToSlot(row) {
  const slot = {};
  if (row.unit_id != null && row.unit_id !== "") slot.unitId = row.unit_id;
  if (row.ad_intervals != null) slot.adIntervals = row.ad_intervals;
  if (row.src) slot.src = row.src;
  if (row.href) slot.href = row.href;
  if (row.title) slot.title = row.title;
  if (row.disabled) slot.disabled = true;
  return slot;
}

function rowToSplash(row) {
  return {
    enabled: row.enabled === 1,
    unitId: row.unit_id || "",
    ...(row.src ? { src: row.src } : {}),
    ...(row.href ? { href: row.href } : {}),
  };
}

function rowToBanner(row) {
  const slot = rowToSlot(row);
  if (row.title) slot.title = row.title;
  return slot;
}

export default class AiAdsService extends Base {
  async loadSettingsMap() {
    const rows = await appSettings.findAll({
      where: { setting_key: SETTING_KEYS },
      raw: true,
    });
    const map = { ...DEFAULT_APP_SETTINGS };
    for (const row of rows) {
      const v = row.setting_value;
      map[row.setting_key] =
        typeof v === "object" && v !== null && "value" in v ? v.value : v;
    }
    return map;
  }

  async getDefaultPoint() {
    const map = await this.loadSettingsMap();
    const n = Number(map.default_point);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_APP_SETTINGS.default_point;
  }

  async buildClientAdConfig() {
    const active = await adSlots.findAll({
      where: { status: 1 },
      order: [
        ["slot_type", "ASC"],
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });

    if (!active.length) {
      const settings = await this.loadSettingsMap();
      const custom = (DEFAULT_AD_CONFIG.custom || []).filter(
        (item) => item?.unitId,
      );
      return {
        ...DEFAULT_AD_CONFIG,
        splash_countdown:
          Number(settings.splash_countdown) ||
          DEFAULT_AD_CONFIG.splash_countdown,
        custom,
      };
    }

    const byType = {};
    for (const row of active) {
      if (!byType[row.slot_type]) byType[row.slot_type] = [];
      byType[row.slot_type].push(row);
    }

    const settings = await this.loadSettingsMap();
    const splashRow = byType.splash?.[0];
    const bannerRow = byType.banner?.[0];

    const splash = splashRow
      ? rowToSplash(splashRow)
      : DEFAULT_AD_CONFIG.splash;

    const custom = (byType.custom || [])
      .map(rowToSlot)
      .filter((item) => item?.unitId);

    const list = (byType.list || []).map((row) => {
      const item = rowToSlot(row);
      if (row.disabled) item.disabled = true;
      return item;
    });

    const ad = {
      splash,
      splash_countdown:
        Number(settings.splash_countdown) ||
        DEFAULT_AD_CONFIG.splash_countdown,
      custom,
      list,
    };

    if (bannerRow) {
      ad.banner = rowToBanner(bannerRow);
    }

    return ad;
  }
}
