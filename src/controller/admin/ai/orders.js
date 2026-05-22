/**
 * 运营后台：充值订单
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

export default class OrdersController extends Controller {
  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        uid: Joi.string().optional(),
        status: Joi.string()
          .valid("pending", "success", "closed", "refunded")
          .optional(),
        out_trade_no: Joi.string().optional(),
        product_id: Joi.string().optional(),
        start_at: Joi.date().optional(),
        end_at: Joi.date().optional(),
      }),
    );
    const data = await this.service.admin.ai.orders.list(query);
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.admin.ai.orders.findOne(id);
    ctx.respond(data);
  }

  async refund(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const body = ctx.validate({
      body: {
        mode: Joi.string()
          .valid("cash_and_points", "cash_only", "points_only")
          .default("cash_and_points"),
        reason: Joi.string().min(1).max(500).required(),
      },
    });
    const { uid } = ctx.state.user || {};
    const data = await this.service.admin.ai.refund.refundRechargeOrder({
      orderId: id,
      mode: body.mode,
      reason: body.reason,
      operatorUid: uid,
    });
    ctx.respond(data, null, "退款处理完成");
  }

  async close(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.admin.ai.orders.closePending(id);
    ctx.respond(data, null, "订单已关闭");
  }
}
