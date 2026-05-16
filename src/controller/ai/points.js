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
    const data = await this.service.ai.points.listLogs(uid, query);
    ctx.respond(data);
  }

  async rechargeOrders(ctx) {
    const { uid } = ctx.state.user;
    const query = ctx.validate(ctx.utils.schemaPagination());
    const data = await this.service.ai.points.listRechargeOrders(uid, query);
    ctx.respond(data);
  }
}
