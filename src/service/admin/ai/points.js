/**
 * 运营后台：积分流水与 consume 退积分
 */
import Base from "../../base.js";
import { Op } from "sequelize";
import { pointLogs } from "../../../models/ai/index.js";
import { users } from "../../../models/sys/index.js";

export default class AdminAiPointsService extends Base {
  async listLogs(params) {
    const {
      page = 1,
      pageSize = 20,
      uid,
      biz_type,
      ref_type,
      start_at,
      end_at,
    } = params;
    const where = {};
    if (uid) where.uid = String(uid);
    if (biz_type) where.biz_type = biz_type;
    if (ref_type) where.ref_type = ref_type;
    if (start_at || end_at) {
      where.created_at = {};
      if (start_at) where.created_at[Op.gte] = start_at;
      if (end_at) where.created_at[Op.lte] = end_at;
    }

    const res = await pointLogs.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true,
    });

    const rows = res.rows || [];
    const uids = [...new Set(rows.map((r) => r.uid).filter(Boolean))];
    let userMap = {};
    if (uids.length) {
      const userRows = await users.findAll({
        where: { uid: { [Op.in]: uids } },
        attributes: ["uid", "username", "nickname"],
        raw: true,
      });
      userMap = Object.fromEntries(userRows.map((u) => [u.uid, u]));
    }

    return this.composePaginationData(
      {
        rows: rows.map((row) => ({
          ...row,
          user: userMap[row.uid] || null,
        })),
        count: res.count,
      },
      page,
      pageSize,
    );
  }

  async refundConsume({ consume_log_id, reason, operatorUid }) {
    const reasonStr = String(reason || "").trim();
    if (!reasonStr) {
      throw Object.assign(new Error("请填写退款原因"), { status: 400 });
    }

    const orig = await pointLogs.findOne({
      where: { id: consume_log_id, biz_type: "consume" },
      raw: true,
    });
    if (!orig) {
      throw Object.assign(new Error("扣点流水不存在"), { status: 404 });
    }

    const log = await this.service.ai.points.refundConsumeLog({
      uid: orig.uid,
      consumeLogId: consume_log_id,
      reason: `[运营] ${reasonStr}`,
    });

    if (!log) {
      throw Object.assign(new Error("退积分失败或已退过"), { status: 400 });
    }

    return {
      refund_log_id: log.id,
      consume_log_id,
      uid: orig.uid,
      amount: -Number(orig.delta),
      operator_uid: operatorUid ? String(operatorUid) : null,
    };
  }
}
