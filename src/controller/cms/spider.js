
/**
 * @Author: colpu
 * @Date: 2026-01-14 16:48:23
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-28 23:48:02
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import request from "../../utils/spider/request.js";
import * as cheerio from 'cheerio';

/**
 * 爬虫管理控制器（CMS），用于配置和执行网页爬虫任务
 */
export default class SpiderController extends Controller {
  /**
   * @api {get} /spider/list
   * @apiName spiderList
   * @apiDescription 分页获取爬虫配置列表
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} [page=1] 页码
   * @apiQuery {Number} [pageSize=20] 每页条数
   * @apiSuccess {Object} data 分页爬虫配置列表
   */
  async list(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
      },
    });
    const data = await this.service.cms.spider.list(query);
    return ctx.respond(data);
  }

  /**
   * @api {get} /spider
   * @apiName spiderFindOne
   * @apiDescription 根据ID获取爬虫配置详情
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 爬虫配置ID (必需)
   * @apiSuccess {Object} data 爬虫配置详情
   */
  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.spider.findOne(id);
    ctx.respond(data);
  };

  /**
   * @api {post} /spider
   * @apiName spiderCreate
   * @apiDescription 创建爬虫配置
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} title 爬虫标题 (必需)
   * @apiBody {String} [url] 爬取URL
   * @apiBody {String} [parse_data] 解析脚本
   * @apiSuccess {Object} data 创建的爬虫配置信息
   */
  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        title: Joi.string().required(),
      },
    });

    const data = await this.service.cms.spider.create(body);
    ctx.respond(data, null, '创建成功');
  };

  /**
   * @api {put} /spider
   * @apiName spiderUpdate
   * @apiDescription 更新爬虫配置
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {Number} id 爬虫配置ID (必需)
   * @apiSuccess {Object} data 更新后的爬虫配置信息
   */
  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });

    const data = await this.service.cms.spider.update(body);
    ctx.respond(data, null, '更新成功');

  };

  /**
   * @api {delete} /spider
   * @apiName spiderDelete
   * @apiDescription 删除爬虫配置
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {Number} id 爬虫配置ID (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.spider.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };

  /**
   * @api {get} /spider/schedule
   * @apiName spiderSchedule
   * @apiDescription 执行爬虫定时任务（按配置ID爬取一页）
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} id 爬虫配置ID (必需)
   * @apiSuccess {Object} data 爬取结果
   */
  async spiderSchedule(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(), // 操作事件
      },
    });
    const res = await this.service.cms.spider.findOne(id);
    const data = await this._spider(res);
    let { end_page } = res;

    end_page = parseInt(end_page || '0', 10);
    const newPage = end_page > 0 ? end_page + 1 : 0
    await this.service.cms.spider.update({
      id,
      start_page: newPage,
      end_page: newPage,
    });
    ctx.respond(data, 0, '测试接口');
  }

  /**
   * @api {get} /spider/auto
   * @apiName autoSpider
   * @apiDescription 自动执行所有爬虫任务
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Object} data 执行结果
   */
  async autoSpider(ctx) {
    const list = await this.service.cms.spider.findAll();

  }

  /**
   * @api {post} /spider/schedule
   * @apiName spider
   * @apiDescription 手动执行爬虫（传入爬虫配置 body）
   * @apiGroup CMS-Spider
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {String} url 爬取URL
   * @apiBody {String} parse_data 解析脚本
   * @apiBody {Number} [start_page] 起始页
   * @apiBody {Number} [end_page] 结束页
   * @apiSuccess {Object} data 爬取结果
   */
  async spider(ctx) {
    const body = ctx.validateAsync({
      body: {},
    });
    const data = await this._spider(body);
    ctx.respond(data, 0, '测试接口');
  }
  async _spider(body) {
    const { parse_data, url: originUrl, is_test = false } = body;
    let { start_page, end_page } = body;
    // 处理页码
    start_page = parseInt(start_page || '0', 10);
    end_page = parseInt(end_page || '0', 10);
    const domain = new URL(originUrl).origin;
    const fnString = `
        return (async(inject)=>{
          ${parse_data}
        })(inject);`;
    const parseFn = new Function('inject', fnString);
    const isPage = originUrl.indexOf('{page}') > -1;

    const { clearHtml, minify } = this.ctx.utils;

    // 如果不是分页，则直接爬取
    let res;
    if (!isPage) {
      res = await parseFn({ url: originUrl, domain, params: { ...body, start_page, end_page }, fetch: request, cheerio, clearHtml, minify });
      if (!is_test) {
        // 记录每一页的错误日志
        this._spiderErrorLog(res);
        // 写入数据库
        res = await this._spiderInDb(res);
      }
    } else {

      // 纠正开始页和结束页
      if (start_page < 0) {
        start_page = 0;
      }
      if (end_page < 0) {
        end_page = 0;
      }

      // 获得有多少页需要爬取
      let len = end_page - start_page + 1;
      len = len <= 0 ? 1 : len;
      // 开始爬取
      for (let i = 0; i < len; i++) {
        const page = start_page + i;
        const url = originUrl.replace('{page}', page || '');
        res = await parseFn({ url, domain, params: { ...body, start_page, end_page }, fetch: request, cheerio, clearHtml, minify });
        console.log(`正在写入数据库`);
        if (!is_test) {
          // 记录每一页的错误日志
          this._spiderErrorLog(res);
          // 写入数据库
          res = await this._spiderInDb(res);
        }
        console.log(`写入数据库结束`);
      }
    }
    return res;
  }
  async _spiderInDb(data) {
    const dataArr = data.map(item => item.data);
    const len = dataArr.length;
    const result = [];
    for (let i = 0; i < len; i++) {
      const data = dataArr[i];
      try {
        const res = await this.service.cms.article.create(data);
        result.push({ status: 0, ...res })
      } catch (error) {
        result.push({ status: 1, message: error.message, data });
      }
    }
    return result;
  }
  async _spiderErrorLog(data) {
    // console.log(data)
  }
}
