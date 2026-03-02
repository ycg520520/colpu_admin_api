/**
 * @Author: colpu
 * @Date: 2026-01-14 16:48:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-01-14 22:15:39
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";

/**
 * 轮播图管理控制器（CMS）
 */
export default class SliderController extends Controller {
  /**
   * @api {get} /slider/list
   * @apiName sliderList
   * @apiDescription 分页获取轮播图列表
   * @apiGroup CMS-Slider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页轮播图列表
   */
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.slider.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /slider
   * @apiName sliderFindOne
   * @apiDescription 根据ID获取轮播图详情
   * @apiGroup CMS-Slider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 轮播图ID (必需)
   * @apiSuccess {Object} data 轮播图详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.slider.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /slider
   * @apiName sliderCreate
   * @apiDescription 创建轮播图
   * @apiGroup CMS-Slider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} title 标题 (必需)
   * @apiBody {String} src 图片地址 (必需)
   * @apiSuccess {Object} data 创建的轮播图信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        title: Joi.string().required(),
        src: Joi.string().required(),
      },
    });

    const data = await this.service.cms.slider.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /slider
   * @apiName sliderUpdate
   * @apiDescription 更新轮播图
   * @apiGroup CMS-Slider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 轮播图ID (必需)
   * @apiSuccess {Object} data 更新后的轮播图信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });

    const data = await this.service.cms.slider.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /slider
   * @apiName sliderDelete
   * @apiDescription 删除轮播图
   * @apiGroup CMS-Slider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 轮播图ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.slider.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

}
