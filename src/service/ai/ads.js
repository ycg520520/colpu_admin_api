/**
 * 小程序广告配置（DB + 默认兜底）
 */
import Base from "../base.js";
import { adSlots, appSettings } from "../../models/ai/index.js";
import { Op } from "sequelize";
const SLOT_TYPES = ["splash", "banner", "custom", "list"];
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

function pickSlotPayload(data) {
  const payload = {};
  if (data.slot_type !== undefined) payload.slot_type = data.slot_type;
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order;
  if (data.status !== undefined) payload.status = data.status;
  if (data.enabled !== undefined) {
    payload.enabled = data.enabled ? 1 : 0;
  }
  if (data.unit_id !== undefined) payload.unit_id = data.unit_id ?? "";
  if (data.unitId !== undefined) payload.unit_id = data.unitId ?? "";
  if (data.ad_intervals !== undefined) payload.ad_intervals = data.ad_intervals;
  if (data.adIntervals !== undefined) payload.ad_intervals = data.adIntervals;
  if (data.src !== undefined) payload.src = data.src;
  if (data.href !== undefined) payload.href = data.href;
  if (data.title !== undefined) payload.title = data.title;
  if (data.disabled !== undefined) {
    payload.disabled = data.disabled ? 1 : 0;
  }
  return payload;
}

function formatSlotRow(row) {
  if (!row) return row;
  const r = typeof row.toJSON === "function" ? row.toJSON() : row;
  return {
    ...r,
    unitId: r.unit_id,
    adIntervals: r.ad_intervals,
    enabled: r.enabled === 1,
    disabled: r.disabled === 1,
  };
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

  list(params) {
    const {
      page = 1,
      pageSize = 20,
      slot_type,
      status,
    } = params;
    const where = { status: { [Op.ne]: 0 } };
    if (slot_type) where.slot_type = slot_type;
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }

    return adSlots
      .findAndCountAll({
        where,
        order: [
          ["slot_type", "ASC"],
          ["sort_order", "DESC"],
          ["id", "ASC"],
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      .then((res) => ({
        rows: (res.rows || []).map(formatSlotRow),
        count: res.count,
      }))
      .then((res) => this.composePaginationData(res, page, pageSize));
  }

  async findOne(id) {
    const row = await adSlots.findOne({
      where: { id, status: { [Op.ne]: 0 } },
    });
    if (!row) {
      throw Object.assign(new Error("广告位不存在"), { status: 404 });
    }
    return formatSlotRow(row);
  }

  async create(data) {
    const slot_type = data.slot_type;
    if (!SLOT_TYPES.includes(slot_type)) {
      throw Object.assign(new Error(`slot_type 须为 ${SLOT_TYPES.join("|")}`), {
        status: 400,
      });
    }
    if (slot_type === "splash") {
      const exists = await adSlots.findOne({
        where: { slot_type: "splash", status: 1 },
      });
      if (exists) {
        throw Object.assign(new Error("开屏广告位已存在，请编辑原记录"), {
          status: 400,
        });
      }
    }
    const row = await adSlots.create({
      ...pickSlotPayload(data),
      slot_type,
      status: 1,
    });
    return formatSlotRow(row);
  }

  async update(data) {
    const { id, ...rest } = data;
    const row = await adSlots.findOne({
      where: { id, status: { [Op.ne]: 0 } },
    });
    if (!row) {
      throw Object.assign(new Error("广告位不存在"), { status: 404 });
    }
    await row.update(pickSlotPayload(rest));
    return formatSlotRow(row);
  }

  async delete(id) {
    const row = await adSlots.findOne({
      where: { id, status: { [Op.ne]: 0 } },
    });
    if (!row) {
      throw Object.assign(new Error("广告位不存在"), { status: 404 });
    }
    await row.update({ status: 0 });
    return true;
  }

  async getSettings() {
    const rows = await appSettings.findAll({ raw: true });
    const map = { ...DEFAULT_APP_SETTINGS };
    for (const row of rows) {
      const v = row.setting_value;
      map[row.setting_key] =
        typeof v === "object" && v !== null && "value" in v ? v.value : v;
    }
    return {
      splash_countdown:
        Number(map.splash_countdown) ?? DEFAULT_APP_SETTINGS.splash_countdown,
      default_point:
        Number(map.default_point) ?? DEFAULT_APP_SETTINGS.default_point,
      preview_ad: DEFAULT_AD_CONFIG,
    };
  }

  async updateSettings(data) {
    const entries = [
      ["splash_countdown", data.splash_countdown],
      ["default_point", data.default_point],
    ];
    for (const [key, value] of entries) {
      if (value === undefined) continue;
      const [row] = await appSettings.findOrCreate({
        where: { setting_key: key },
        defaults: {
          setting_key: key,
          setting_value: value,
          remark: key === "splash_countdown" ? "开屏倒计时（秒）" : "每次生成默认扣点",
        },
      });
      if (!row.isNewRecord) {
        await row.update({ setting_value: value });
      }
    }
    return this.getSettings();
  }
}
