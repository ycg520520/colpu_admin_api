/**
 * @Author: colpu
 * @Date: 2026-05-14
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

export default class PointsController extends Controller {
  async logs(ctx) {
    const { uid } = ctx.state.user;
    const query = ctx.validate(ctx.utils.schemaPagination());
    const data = await this.service.ai.points.logs(uid, query);
    ctx.respond(data);
  }

  async rechargeOrders(ctx) {
    const { uid } = ctx.state.user;
    const query = ctx.validate(ctx.utils.schemaPagination());
    const data = await this.service.ai.points.listRechargeOrders(uid, query);
    ctx.respond(data);
  }

  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        uid: Joi.string().optional(),
        biz_type: Joi.string().optional(),
        ref_type: Joi.string().optional(),
        start_at: Joi.date().optional(),
        end_at: Joi.date().optional(),
      }),
    );
    const data = await this.service.ai.points.listLogs(query);
    ctx.respond(data);
  }

  async refundConsume(ctx) {
    const body = ctx.validate({
      body: {
        consume_log_id: Joi.number().integer().required(),
        reason: Joi.string().min(1).max(500).required(),
      },
    });
    const { uid } = ctx.state.user || {};
    const data = await this.service.ai.points.refundConsume({
      ...body,
      operatorUid: uid,
    });
    ctx.respond(data, null, "积分已退回");
  }
}
