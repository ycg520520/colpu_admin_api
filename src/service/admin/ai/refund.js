/**
 * 运营后台：充值订单全额退款（现金原路 + 积分扣回）
 */
import crypto from "crypto";
import Base from "../../base.js";
import {
  aiDb,
  pointLogs,
  rechargeOrders,
  inviteCampaigns,
} from "../../../models/ai/index.js";
import { users, userThirdAuth, thirdAuth } from "../../../models/sys/index.js";
import { resolveVirtualAppKey } from "../../../utils/wechat/virtual_pay.js";
import {
  fetchClientCredentialToken,
  xpayQueryOrder,
  xpayRefundOrder,
} from "../../../utils/wechat/xpay_refund.js";

const WECHAT_AUTH_TYPE = 1;
const XPAY_REFUND_IDEMPOTENT_ERR = 268490004;

export default class AdminAiRefundService extends Base {
  /** 是否已扣回该充值单积分（幂等） */
  async hasRechargePointsRevoked(rechargeOrderId) {
    const row = await pointLogs.findOne({
      where: {
        biz_type: "recharge_revoke",
        ref_type: "recharge_order",
        ref_id: String(rechargeOrderId),
      },
      raw: true,
    });
    return !!row;
  }

  async #getWechatOpenidForUid(uidStr) {
    const user = await users.findOne({
      where: { uid: String(uidStr) },
      raw: true,
      attributes: ["id"],
    });
    if (!user?.id) return null;
    const uta = await userThirdAuth.findOne({
      where: { user_id: user.id },
      raw: true,
      attributes: ["openid"],
    });
    if (!uta?.openid) return null;
    const ta = await thirdAuth.findOne({
      where: { openid: uta.openid, type: WECHAT_AUTH_TYPE },
      raw: true,
      attributes: ["openid"],
    });
    return ta?.openid || null;
  }

  /**
   * 充值订单全额退款（仅全额，不接受部分金额）
   * @param {'cash_and_points'|'cash_only'|'points_only'} mode
   */
  async refundRechargeOrder({
    orderId,
    mode = "cash_and_points",
    reason,
    operatorUid,
  }) {
    const allowed = ["cash_and_points", "cash_only", "points_only"];
    if (!allowed.includes(mode)) {
      throw Object.assign(new Error("无效的退款模式"), { status: 400 });
    }
    const reasonStr = String(reason || "").trim();
    if (!reasonStr) {
      throw Object.assign(new Error("请填写退款原因"), { status: 400 });
    }

    const order = await rechargeOrders.findByPk(orderId);
    if (!order) {
      throw Object.assign(new Error("订单不存在"), { status: 404 });
    }
    if (order.status === "refunded") {
      throw Object.assign(new Error("订单已退款"), { status: 400 });
    }
    if (order.status !== "success") {
      throw Object.assign(
        new Error("仅支持对已支付成功的订单退款"),
        { status: 400 },
      );
    }

    const campaign = await inviteCampaigns.findOne({
      where: { leader_order_id: order.id },
      raw: true,
    });
    if (campaign && ["open", "pending_refund"].includes(campaign.status)) {
      throw Object.assign(
        new Error("该订单关联邀请返现活动进行中，请先结束活动或走自动返现流程"),
        { status: 409 },
      );
    }

    const pointsRevoked = await this.hasRechargePointsRevoked(order.id);
    const grantTotal = this.service.ai.points.rechargeGrantTotal(order);
    const auditMeta = {
      operator_uid: operatorUid ? String(operatorUid) : null,
      reason: reasonStr,
      mode,
      full_amount_cents: Number(order.sale_price) || 0,
      points_revoked: grantTotal,
    };

    let refundOrderId = null;
    let wechatRefundWxOrderId = null;
    let cashSkipped = false;

    if (mode === "cash_and_points" || mode === "cash_only") {
      const cashResult = await this.#refundCashFull(order, auditMeta);
      refundOrderId = cashResult.refundOrderId;
      wechatRefundWxOrderId = cashResult.wechatRefundWxOrderId;
      cashSkipped = cashResult.skipped;
    }

    if (mode === "cash_and_points" || mode === "points_only") {
      if (!pointsRevoked) {
        await aiDb.transaction(async (tAi) => {
          await this.service.ai.points.revokeRechargePointsForCashRefund({
            uid: order.uid,
            rechargeOrderId: order.id,
            pointAmount: grantTotal,
            transaction: tAi,
          });
        });
      }
    }

    const prevMeta =
      order.meta && typeof order.meta === "object" ? order.meta : {};
    await order.update({
      status: "refunded",
      meta: {
        ...prevMeta,
        admin_refund: {
          ...auditMeta,
          refund_order_id: refundOrderId,
          wechat_refund_wx_order_id: wechatRefundWxOrderId,
          cash_skipped: cashSkipped,
          at: new Date().toISOString(),
        },
      },
    });

    return {
      order_id: order.id,
      status: "refunded",
      mode,
      refund_order_id: refundOrderId,
      points_revoked: grantTotal,
      points_already_revoked: pointsRevoked,
      cash_skipped: cashSkipped,
    };
  }

  /** 微信虚拟支付全额原路退（refund_fee = min(left_fee, sale_price)） */
  async #refundCashFull(order, auditMeta) {
    const wx = this.config.wx || {};
    const virtual = wx.virtualPay || {};
    const envNum = Number(virtual.env) || 0;
    const appKey = resolveVirtualAppKey(virtual, envNum);
    const { appId, appSecret } = wx;
    if (!appId || !appSecret || !appKey) {
      throw Object.assign(
        new Error("虚拟支付未配置，无法原路退款"),
        { status: 503 },
      );
    }

    const openid = await this.#getWechatOpenidForUid(order.uid);
    if (!openid) {
      throw Object.assign(
        new Error("用户未绑定微信，无法原路退款"),
        { status: 400 },
      );
    }

    const accessToken = await fetchClientCredentialToken(appId, appSecret);
    const queryRes = await xpayQueryOrder({
      accessToken,
      appKey,
      openid,
      env: envNum,
      outTradeNo: order.out_trade_no,
      wxOrderId: order.transaction_id || null,
    });

    if (queryRes.errcode !== 0) {
      const err = new Error(
        queryRes.errmsg || "查询微信订单失败，无法退款",
      );
      err.status = 502;
      err.meta = { queryRes };
      throw err;
    }

    const leftFee = Number(queryRes.order?.left_fee);
    if (!Number.isFinite(leftFee) || leftFee <= 0) {
      return {
        skipped: true,
        refundOrderId: null,
        wechatRefundWxOrderId: null,
        note: "left_fee_zero",
      };
    }

    const salePrice = Number(order.sale_price) || 0;
    const refundFee = Math.min(leftFee, salePrice || leftFee);
    if (refundFee < salePrice && salePrice > 0) {
      throw Object.assign(
        new Error("仅支持全额退款：微信可退金额不足整单实付"),
        { status: 400 },
      );
    }

    const refundOrderId = `rf${Date.now()}${crypto.randomBytes(3).toString("hex")}`;
    const refundRes = await xpayRefundOrder({
      accessToken,
      appKey,
      openid,
      env: envNum,
      outTradeNo: order.out_trade_no,
      wxOrderId: order.transaction_id || null,
      refundOrderId,
      leftFee,
      refundFee,
      bizMeta: JSON.stringify({
        source: "admin_refund",
        order_id: order.id,
        operator_uid: auditMeta.operator_uid,
      }),
      refundReason: "5",
      reqFrom: "3",
    });

    if (refundRes.errcode !== 0 && refundRes.errcode !== XPAY_REFUND_IDEMPOTENT_ERR) {
      const err = new Error(refundRes.errmsg || "微信退款失败");
      err.status = 502;
      err.meta = { refundRes };
      throw err;
    }

    return {
      skipped: false,
      refundOrderId,
      wechatRefundWxOrderId: refundRes.refund_wx_order_id || null,
    };
  }
}
