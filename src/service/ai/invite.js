/**
 * 指定套餐：团长支付成功后生成邀请码，邀请 N 人（套餐字段 invite_refund_invitees）购买同款并支付成功，
 * 则调用微信虚拟支付 xpay 原路退款并扣回已发积分。
 */
import Base from "../base.js";
import crypto from "crypto";
import { UniqueConstraintError } from "sequelize";
import {
  aiDb,
  inviteCampaigns,
  inviteJoins,
  rechargeOrders,
  rechargePackages,
} from "../../models/ai/index.js";
import { users, userThirdAuth, thirdAuth } from "../../models/sys/index.js";
import { resolveVirtualAppKey } from "../../utils/wechat/virtual_pay.js";
import {
  fetchClientCredentialToken,
  xpayQueryOrder,
  xpayRefundOrder,
} from "../../utils/wechat/xpay_refund.js";

const WECHAT_AUTH_TYPE = 1;

export default class InviteService extends Base {
  /**
   * 创建充值单前：校验邀请码，返回 invite_campaign_id
   */
  async resolveInviteCampaignForCreateOrder({ uid, product_id, invite_code }) {
    const code = invite_code != null ? String(invite_code).trim() : "";
    if (!code) return { invite_campaign_id: null };

    const campaign = await inviteCampaigns.findOne({
      where: { invite_code: code, status: "open" },
      raw: true,
    });
    if (!campaign) {
      throw Object.assign(new Error("邀请码无效或活动已结束"), { status: 400 });
    }
    if (campaign.leader_uid === String(uid)) {
      throw Object.assign(new Error("不能使用自己的邀请码"), { status: 400 });
    }
    if (String(campaign.product_id) !== String(product_id)) {
      throw Object.assign(new Error("邀请活动仅限购买指定同款套餐"), { status: 400 });
    }
    return { invite_campaign_id: campaign.id };
  }

  /** 分享页：根据邀请码展示进度（不含团长隐私信息） */
  async publicSummaryByCode(invite_code) {
    const code = String(invite_code || "").trim();
    if (!code) return { valid: false };
    const c = await inviteCampaigns.findOne({
      where: { invite_code: code, status: "open" },
      raw: true,
    });
    if (!c) return { valid: false };
    const joined = await inviteJoins.count({ where: { campaign_id: c.id } });
    const pkg = await rechargePackages.findByPk(c.product_id, { raw: true });
    return {
      valid: true,
      invite_code: c.invite_code,
      product_id: Number(c.product_id),
      product_name: pkg?.name || null,
      required: c.invitees_required,
      joined,
    };
  }

  /** 团长查看自己订单对应邀请进度 */
  async leaderInvitePanel({ uid, orderId }) {
    const order = await rechargeOrders.findOne({
      where: { id: orderId, uid: String(uid), status: "success" },
      raw: true,
    });
    if (!order) {
      throw Object.assign(new Error("订单不存在或未支付"), { status: 404 });
    }
    const campaign = await inviteCampaigns.findOne({
      where: { leader_order_id: order.id },
      raw: true,
    });
    if (!campaign) {
      return { active: false, reason: "no_campaign" };
    }
    const joined = await inviteJoins.count({ where: { campaign_id: campaign.id } });
    return {
      active: true,
      invite_code: campaign.invite_code,
      product_id: Number(campaign.product_id),
      required: campaign.invitees_required,
      joined,
      status: campaign.status,
    };
  }

  /**
   * 团长首单支付履约后：若套餐开启邀请返现，则创建活动
   */
  async ensureLeaderCampaignAfterLeaderPaid({ order, pkg, transaction }) {
    const required = Number(pkg?.invite_refund_invitees) || 0;
    if (required <= 0) return;
    if (order.invite_campaign_id) return;

    const existed = await inviteCampaigns.findOne({
      where: { leader_order_id: order.id },
      transaction,
      raw: true,
    });
    if (existed) return;

    for (let i = 0; i < 8; i += 1) {
      const invite_code = crypto.randomBytes(4).toString("hex");
      try {
        await inviteCampaigns.create(
          {
            leader_uid: String(order.uid),
            leader_order_id: order.id,
            product_id: String(order.product_id),
            invite_code,
            invitees_required: required,
            status: "open",
          },
          { transaction },
        );
        return;
      } catch (e) {
        if (e instanceof UniqueConstraintError) continue;
        throw e;
      }
    }
    throw Object.assign(new Error("生成邀请码失败，请重试"), { status: 503 });
  }

  /**
   * 被邀请人支付履约后：记录参团，满员则返回 campaignId 供异步触发原路退款
   * @returns {Promise<number|null>}
   */
  async recordInviteeAndMaybeQueueRefund({ order, transaction }) {
    if (!order.invite_campaign_id) return null;

    const campaign = await inviteCampaigns.findOne({
      where: { id: order.invite_campaign_id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!campaign || campaign.status !== "open") return null;

    if (String(order.product_id) !== String(campaign.product_id)) {
      throw Object.assign(new Error("订单套餐与邀请活动不一致"), { status: 400 });
    }
    if (String(order.uid) === String(campaign.leader_uid)) {
      throw Object.assign(new Error("不可使用本人邀请码"), { status: 400 });
    }

    try {
      await inviteJoins.create(
        {
          campaign_id: campaign.id,
          invitee_uid: String(order.uid),
          invitee_order_id: order.id,
        },
        { transaction },
      );
    } catch (e) {
      if (e instanceof UniqueConstraintError) return null;
      throw e;
    }

    const cnt = await inviteJoins.count({
      where: { campaign_id: campaign.id },
      transaction,
    });
    if (cnt < campaign.invitees_required) return null;

    const [affected] = await inviteCampaigns.update(
      { status: "pending_refund" },
      { where: { id: campaign.id, status: "open" }, transaction },
    );
    return affected > 0 ? campaign.id : null;
  }

  /**
   * 满员后：查单可退余额 → 发起 xpay 退款 → 扣回积分 → 标记完成
   */
  async tryRefundLeader(campaignId) {
    const campaign = await inviteCampaigns.findByPk(campaignId);
    if (!campaign || campaign.status !== "pending_refund") return;

    const leaderOrder = await rechargeOrders.findByPk(campaign.leader_order_id);
    if (!leaderOrder || leaderOrder.status !== "success") {
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), reason: "leader_order_invalid" },
      });
      return;
    }

    const wx = this.config.wx || {};
    const virtual = wx.virtualPay || {};
    const envNum = Number(virtual.env) || 0;
    const appKey = resolveVirtualAppKey(virtual, envNum);
    const { appId, appSecret } = wx;
    if (!appId || !appSecret || !appKey) {
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), reason: "wx_config_incomplete" },
      });
      console.error("[invite] 缺少 wx.appId/appSecret 或 virtualPay.appKey");
      return;
    }

    const openid = await this.#getWechatOpenidForUid(campaign.leader_uid);
    if (!openid) {
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), reason: "no_wechat_openid" },
      });
      return;
    }

    let accessToken;
    try {
      accessToken = await fetchClientCredentialToken(appId, appSecret);
    } catch (e) {
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), reason: "access_token", err: String(e?.message || e) },
      });
      return;
    }

    const queryRes = await xpayQueryOrder({
      accessToken,
      appKey,
      openid,
      env: envNum,
      outTradeNo: leaderOrder.out_trade_no,
      wxOrderId: leaderOrder.transaction_id || null,
    });

    if (queryRes.errcode !== 0) {
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), reason: "query_order", queryRes },
      });
      return;
    }

    const leftFee = Number(queryRes.order?.left_fee);
    if (!Number.isFinite(leftFee) || leftFee <= 0) {
      await campaign.update({
        status: "refund_done",
        meta: { ...(campaign.meta || {}), note: "left_fee_zero_skip_refund" },
      });
      return;
    }

    const refundFee = Math.min(leftFee, Number(leaderOrder.sale_price) || leftFee);
    const refundOrderId = `rf${Date.now()}${crypto.randomBytes(3).toString("hex")}`;

    const refundRes = await xpayRefundOrder({
      accessToken,
      appKey,
      openid,
      env: envNum,
      outTradeNo: leaderOrder.out_trade_no,
      wxOrderId: leaderOrder.transaction_id || null,
      refundOrderId,
      leftFee,
      refundFee,
      bizMeta: JSON.stringify({ campaign_id: campaign.id, leader_order_id: leaderOrder.id }),
      refundReason: "5",
      reqFrom: "3",
    });

    if (refundRes.errcode !== 0 && refundRes.errcode !== 268490004) {
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), refundRes },
      });
      console.error("[invite] xpayRefundOrder failed", refundRes);
      return;
    }

    try {
      await aiDb.transaction(async (tAi) => {
        await this.service.ai.points.revokeRechargePointsForCashRefund({
          uid: campaign.leader_uid,
          rechargeOrderId: leaderOrder.id,
          pointAmount: this.service.ai.points.rechargeGrantTotal(leaderOrder),
          transaction: tAi,
        });
        await inviteCampaigns.update(
          {
            status: "refund_done",
            leader_refund_order_id: refundOrderId,
            wechat_refund_wx_order_id: refundRes.refund_wx_order_id || null,
          },
          { where: { id: campaign.id }, transaction: tAi },
        );
      });
    } catch (e) {
      console.error("[invite] 退款成功但扣回积分失败（需人工对账）", e);
      await campaign.update({
        status: "refund_failed",
        meta: { ...(campaign.meta || {}), refund_ok: true, revoke_points_error: String(e?.message || e) },
      });
    }
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
}
