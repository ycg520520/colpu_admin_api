/**
 * 运营后台：AI 分类扩展
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

const exampleItemSchema = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().optional(),
    src: Joi.string().allow("").optional(),
    title: Joi.string().allow("").optional(),
    desc: Joi.string().allow("").optional(),
    size: Joi.object({
      width: Joi.number().optional(),
      height: Joi.number().optional(),
    }).optional(),
  }),
);

const extendBodySchema = {
  classify_id: Joi.number().integer().optional(),
  feature: Joi.string().max(500).allow("", null),
  icon: Joi.string().max(100).allow("", null),
  src: Joi.string().max(255).allow("", null),
  original_src: Joi.string().max(255).allow("", null),
  slider_percent: Joi.number().min(0).max(1).optional(),
  is_scale: Joi.boolean().optional(),
  example_right: Joi.alternatives()
    .try(exampleItemSchema, Joi.string())
    .optional(),
  example_error: Joi.alternatives()
    .try(exampleItemSchema, Joi.string())
    .optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
};

export default class ClassifyExtendController extends Controller {
  async list(ctx) {
    const query = ctx.validate(
      ctx.utils.schemaPagination({
        classify_id: Joi.number().integer().optional(),
        status: Joi.number().integer().valid(0, 1).optional(),
        feature: Joi.string().optional(),
      }),
    );
    const data = await this.service.admin.ai.classifyExtend.list(query);
    ctx.respond(data);
  }

  async findOne(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.admin.ai.classifyExtend.findOne(id);
    ctx.respond(data);
  }

  async create(ctx) {
    const body = ctx.validate({
      body: {
        classify_id: Joi.number().integer().required(),
        src: Joi.string().max(255).required(),
        original_src: Joi.string().max(255).required(),
        ...extendBodySchema,
      },
    });
    const data = await this.service.admin.ai.classifyExtend.create(body);
    ctx.respond(data, null, "创建成功");
  }

  async update(ctx) {
    const body = ctx.validate({
      body: {
        id: Joi.number().integer().required(),
        ...extendBodySchema,
      },
    });
    const data = await this.service.admin.ai.classifyExtend.update(body);
    ctx.respond(data, null, "更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.validate({
      params: { id: Joi.number().integer().required() },
    });
    const data = await this.service.admin.ai.classifyExtend.delete(id);
    ctx.respond(data, data ? 0 : 1, data ? "已下架" : "操作失败");
  }

  async classifyOptions(ctx) {
    const data = await this.service.admin.ai.classifyExtend.classifyOptions();
    ctx.respond(data);
  }
}
