/**
 * @Author: colpu
 * @Date: 2026-03-02
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Joi from "joi";

/**
 * 分页查询通用 schema
 * 用于 ctx.validateAsync({ query: { ...paginationSchema, ...extras } })
 */
export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
};

/**
 * 生成带分页的 query 校验 schema，便于在 controller 中复用
 * @param {Object} [extras={}] 额外字段，如 { dept_id: Joi.number(), keyword: Joi.string() }
 * @returns {Object} 可直接传给 ctx.validateAsync 的 schema
 * @example
 * const params = ctx.validateAsync(ctx.utils.schemaPagination());
 * const params = ctx.validateAsync(ctx.utils.schemaPagination({ dept_id: Joi.number() }));
 */
export function schemaPagination(extras = {}) {
  return {
    query: {
      ...paginationSchema,
      ...extras,
    },
  };
}
