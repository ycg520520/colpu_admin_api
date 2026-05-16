/**
 * @Author: colpu
 * @Date: 2026-05-14
 */
import Base from "../base.js";
import crypto from "crypto";
import {
  sysDb,
  users,
} from "../../models/sys/index.js";
import {
  aiDb,
  pointLogs,
  rechargeOrders,
  rechargePackages,
} from "../../models/ai/index.js";
import { virtualPaymentSigns, stringifyVirtualSignData, resolveVirtualAppKey } from "../../utils/wechat/virtual_pay.js";
export default class PointsService extends Base {

  async listLogs(uid, { page = 1, pageSize = 20 }) {
    return pointLogs.findAndCountAll({
      where: { uid: String(uid) },
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true,
    }).then((res) => this.composePaginationData(res, page, pageSize));
  }

  async listRechargeOrders(uid, { page = 1, pageSize = 20 }) {
    return rechargeOrders.findAndCountAll({
      where: { uid },
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true,
    }).then((res) => this.composePaginationData(res, page, pageSize));
  }

  /** 上架中的虚拟支付套餐列表（供小程序展示） */
  async listRechargePackages() {
    const rows = await rechargePackages.findAll({
      where: { status: 1 },
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
    return rows;
  }

  async findRechargePackageById(id) {
    const row = await rechargePackages.findOne({
      where: {
        status: 1,
        id,
      },
      raw: true,
    });
    return row;
  }

  /**
   * AI 任务扣积分（在已拿到 task_id、即将落库前调用）。
   * @returns {{ logId: number, amount: number, balance_after: number }}
   */
  async consumeForAiTask({ uid, amount, taskId, classifyId, title, meta }) {
    if (!uid) throw Object.assign(new Error("未登录"), { status: 401 });
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) throw Object.assign(new Error("扣点无效"), { status: 400 });
    return sysDb.transaction(async (tSys) => {
      const user = await users.findOne({
        where: { uid: String(uid) },
        transaction: tSys,
        lock: tSys.LOCK.UPDATE,
      });
      if (!user) throw Object.assign(new Error("用户不存在"), { status: 401 });
      const cur = Number(user.points) || 0;
      if (cur < n) {
        throw Object.assign(new Error("积分不足"), { status: 402 });
      }
      const balance = cur - n;
      await user.update({ points: balance }, { transaction: tSys });
      const log = await aiDb.transaction(async (tAi) =>
        pointLogs.create(
          {
            uid: String(uid),
            delta: -n,
            balance_after: balance,
            biz_type: "consume",
            title: title || "AI 生成消耗",
            ref_type: "ai_task",
            ref_id: String(taskId),
            meta: { classify_id: classifyId, ...(meta || {}) },
          },
          { transaction: tAi },
        ),
      );
      return { logId: log.id, amount: n, balance_after: balance };
    });
  }

  async updateConsumeTaskRef(logId, taskId) {
    await pointLogs.update(
      { ref_id: String(taskId) },
      { where: { id: logId, biz_type: "consume" } },
    );
  }

  async refundConsumeLog({ uid, consumeLogId, reason }) {
    const orig = await pointLogs.findOne({
      where: { id: consumeLogId, uid: String(uid), biz_type: "consume" },
      raw: true,
    });
    if (!orig) return null;
    if (orig.delta >= 0) return null;
    const existed = await pointLogs.findOne({
      where: {
        uid: String(uid),
        biz_type: "refund",
        ref_type: "point_log",
        ref_id: String(consumeLogId),
      },
      raw: true,
    });
    if (existed) return existed;
    const refundAmount = -Number(orig.delta);
    return sysDb.transaction(async (tSys) => {
      const user = await users.findOne({
        where: { uid: String(uid) },
        transaction: tSys,
        lock: tSys.LOCK.UPDATE,
      });
      if (!user) return null;
      const cur = Number(user.points) || 0;
      const balance = cur + refundAmount;
      await user.update({ points: balance }, { transaction: tSys });
      return aiDb.transaction(async (tAi) =>
        pointLogs.create(
          {
            uid: String(uid),
            delta: refundAmount,
            balance_after: balance,
            biz_type: "refund",
            title: reason || "扣点退回",
            ref_type: "point_log",
            ref_id: String(consumeLogId),
            meta: { original: orig },
          },
          { transaction: tAi },
        ),
      );
    });
  }

  /**
   * 创建虚拟支付订单并生成签名（入参由 pay.createRecharge 校验后传入）。
   */
  async createRechargeVirtualSession({
    uid,
    session_key,
    wx,
    sale_price,
    price,
    point,
    description,
    product_id,
    buy_quantity,
  }) {
    const virtual = wx?.virtualPay || {};
    const { offerId, mode = "short_series_goods", env = 0 } = virtual;
    const envNum = Number(env) || 0;
    const appKey = resolveVirtualAppKey(virtual, envNum);
    if (!offerId || !appKey) {
      throw Object.assign(
        new Error("虚拟支付未配置：请在 .config.js 的 virtualPay（合并为 config.wx.virtualPay）中设置 offerId 与 appKey"),
        { status: 503 },
      );
    }
    const out_trade_no = `pt${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
    const order = await rechargeOrders.create({
      uid: String(uid),
      out_trade_no,
      product_id: String(product_id),
      sale_price,
      point,
      status: "pending",
      description,
      prepay_id: null,
    });
    const attach = `oid=${order.id}`;
    let signObj;
    if (mode === "short_series_coin") {
      signObj = {
        offerId: String(offerId),
        buyQuantity: buy_quantity > 0 ? buy_quantity : 1,
        env: envNum,
        currencyType: "CNY",
        outTradeNo: out_trade_no,
        attach,
      };
    } else {
      signObj = {
        offerId: String(offerId),
        buyQuantity: 1,
        env: envNum,
        currencyType: "CNY",
        productId: String(product_id),
        goodsPrice: sale_price,
        outTradeNo: out_trade_no,
        attach,
      };
    }
    const signData = stringifyVirtualSignData(signObj, mode);
    const { paySig, signature } = virtualPaymentSigns({
      signData,
      sessionKey: session_key,
      appKey,
    });
    return {
      order_id: order.id,
      out_trade_no,
      point,
      price,
      sale_price,
      mode,
      env: envNum,
      paySig,
      signature,
      signData,
    };
  }

  /**
   * 支付回调：幂等发放积分
   */
  async fulfillRechargeByNotify({ out_trade_no, transaction_id }) {
    return aiDb.transaction(async (tAi) => {
      const order = await rechargeOrders.findOne({
        where: { out_trade_no },
        transaction: tAi,
        lock: tAi.LOCK.UPDATE,
      });
      if (!order) return { ok: false, reason: "order_not_found" };
      if (order.status === "success") return { ok: true, duplicate: true };

      const grant = order.point;
      const uid = order.uid;
      let hasUser = false;
      let balanceAfter = 0;

      await sysDb.transaction(async (tSys) => {
        const user = await users.findOne({
          where: { uid },
          transaction: tSys,
          lock: tSys.LOCK.UPDATE,
        });
        if (!user) return;
        hasUser = true;
        const cur = Number(user.points) || 0;
        balanceAfter = cur + grant;
        await user.update({ points: balanceAfter }, { transaction: tSys });
      });

      if (!hasUser) return { ok: false, reason: "user_missing" };

      try {
        await pointLogs.create(
          {
            uid: String(uid),
            delta: grant,
            balance_after: balanceAfter,
            biz_type: "recharge",
            title: order.description || "虚拟支付充值",
            ref_type: "recharge_order",
            ref_id: String(order.id),
            meta: { out_trade_no, transaction_id },
          },
          { transaction: tAi },
        );
        await order.update(
          {
            status: "success",
            transaction_id: transaction_id || null,
          },
          { transaction: tAi },
        );
      } catch (e) {
        await sysDb.transaction(async (tSys) => {
          const user = await users.findOne({
            where: { uid },
            transaction: tSys,
            lock: tSys.LOCK.UPDATE,
          });
          if (user) {
            const next = Math.max(0, (Number(user.points) || 0) - grant);
            await user.update({ points: next }, { transaction: tSys });
          }
        });
        throw e;
      }

      return { ok: true, duplicate: false };
    });
  }
}
