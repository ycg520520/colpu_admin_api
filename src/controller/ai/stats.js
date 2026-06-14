/**
 * 运营后台：统计
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

export default class StatsController extends Controller {
  async overview(ctx) {
    const data = await this.service.ai.stats.overview();
    ctx.respond(data);
  }

  async trend(ctx) {
    const { days } = ctx.validate({
      query: { days: Joi.number().integer().min(1).max(90).default(30) },
    });
    const data = await this.service.ai.stats.trend({ days });
    ctx.respond(data);
  }
}
