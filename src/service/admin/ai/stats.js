/**
 * 运营后台：订单与积分统计
 */
import Base from "../../base.js";
import { QueryTypes } from "sequelize";
import { aiDb, rechargeOrders, pointLogs } from "../../../models/ai/index.js";
import { Op, fn, col } from "sequelize";

function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default class AdminAiStatsService extends Base {
  async overview() {
    const today = dayStart();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const [todayOrders, weekOrders, todayRefunded, weekPointSum] = await Promise.all([
      this.#orderAgg({ created_at: { [Op.gte]: today } }),
      this.#orderAgg({ created_at: { [Op.gte]: weekAgo } }),
      rechargeOrders.count({
        where: {
          status: "refunded",
          updated_at: { [Op.gte]: today },
        },
      }),
      pointLogs.findAll({
        attributes: [
          "biz_type",
          [fn("SUM", col("delta")), "total_delta"],
          [fn("COUNT", col("id")), "cnt"],
        ],
        where: { created_at: { [Op.gte]: weekAgo } },
        group: ["biz_type"],
        raw: true,
      }),
    ]);

    return {
      today: todayOrders,
      last_7_days: weekOrders,
      today_refund_count: todayRefunded,
      point_logs_7d: weekPointSum,
    };
  }

  async #orderAgg(whereExtra) {
    const rows = await rechargeOrders.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "cnt"],
        [fn("SUM", col("sale_price")), "amount_cents"],
      ],
      where: whereExtra,
      group: ["status"],
      raw: true,
    });
    let total = 0;
    let success_count = 0;
    let success_amount_cents = 0;
    for (const r of rows) {
      const cnt = Number(r.cnt) || 0;
      const amt = Number(r.amount_cents) || 0;
      total += cnt;
      if (r.status === "success") {
        success_count = cnt;
        success_amount_cents = amt;
      }
    }
    return {
      order_count: total,
      paid_count: success_count,
      gmv_cents: success_amount_cents,
      by_status: rows,
    };
  }

  async trend({ days = 30 } = {}) {
    const n = Math.min(Math.max(Number(days) || 30, 1), 90);
    const start = dayStart();
    start.setDate(start.getDate() - (n - 1));

    const rows = await aiDb.query(
      `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS order_count,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS paid_count,
        SUM(CASE WHEN status = 'success' THEN sale_price ELSE 0 END) AS gmv_cents,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refund_count
      FROM recharge_orders
      WHERE created_at >= :start
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      {
        replacements: { start },
        type: QueryTypes.SELECT,
      },
    );

    return { days: n, rows };
  }
}
