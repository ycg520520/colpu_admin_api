/**
 * 运营后台：充值订单
 */
import Base from "../../base.js";
import { Op } from "sequelize";
import {
  rechargeOrders,
  pointLogs,
} from "../../../models/ai/index.js";
import { users } from "../../../models/sys/index.js";

export default class AdminAiOrdersService extends Base {
  async list(params) {
    const {
      page = 1,
      pageSize = 20,
      uid,
      status,
      out_trade_no,
      product_id,
      start_at,
      end_at,
    } = params;
    const where = {};
    if (uid) where.uid = String(uid);
    if (status) where.status = status;
    if (product_id) where.product_id = String(product_id);
    if (out_trade_no) {
      where.out_trade_no = { [Op.like]: `%${out_trade_no}%` };
    }
    if (start_at || end_at) {
      where.created_at = {};
      if (start_at) where.created_at[Op.gte] = start_at;
      if (end_at) where.created_at[Op.lte] = end_at;
    }

    const res = await rechargeOrders.findAndCountAll({
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
        attributes: ["uid", "username", "nickname", "phone"],
        raw: true,
      });
      userMap = Object.fromEntries(userRows.map((u) => [u.uid, u]));
    }

    const enriched = rows.map((row) => ({
      ...row,
      user: userMap[row.uid] || null,
    }));

    return this.composePaginationData(
      { rows: enriched, count: res.count },
      page,
      pageSize,
    );
  }

  async findOne(id) {
    const order = await rechargeOrders.findByPk(id, { raw: true });
    if (!order) {
      throw Object.assign(new Error("订单不存在"), { status: 404 });
    }

    const user = await users.findOne({
      where: { uid: String(order.uid) },
      attributes: ["uid", "username", "nickname", "phone", "points"],
      raw: true,
    });

    const logs = await pointLogs.findAll({
      where: {
        uid: String(order.uid),
        ref_type: "recharge_order",
        ref_id: String(order.id),
      },
      order: [["created_at", "ASC"]],
      raw: true,
    });

    const pointsRevoked = await this.service.admin.ai.refund.hasRechargePointsRevoked(
      order.id,
    );

    return {
      order,
      user,
      point_logs: logs,
      points_revoked: pointsRevoked,
    };
  }

  async closePending(orderId) {
    const order = await rechargeOrders.findByPk(orderId);
    if (!order) {
      throw Object.assign(new Error("订单不存在"), { status: 404 });
    }
    if (order.status !== "pending") {
      throw Object.assign(new Error("仅可关闭待支付订单"), { status: 400 });
    }
    await order.update({ status: "closed" });
    return { order_id: order.id, status: "closed" };
  }
}
