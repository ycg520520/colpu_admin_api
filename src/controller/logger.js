/**
 * @Author: colpu
 * @Date: 2026-01-17 15:16:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-19 16:16:14
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";

/**
 * 操作日志控制器
 */
export default class LogsController extends Controller {
  /**
   * @api {get} /log/list
   * @apiName logList
   * @apiDescription 分页获取操作日志列表
   * @apiGroup Log
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页日志列表
   */
  async list(ctx) {
    const params = ctx.validateAsync(ctx.utils.schemaPagination());
    const data = await this.service.logs.list(params);
    return ctx.respond(data);
  }
}
