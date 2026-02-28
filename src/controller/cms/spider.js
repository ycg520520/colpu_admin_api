
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
export default class SpiderController extends Controller {
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

  async findOne(ctx) {
    const { id } = ctx.validateAsync({
      query: {
        id: Joi.string().required(),
      },
    });
    const data = await this.service.cms.spider.findOne(id);
    ctx.respond(data);
  };

  async create(ctx) {
    const body = ctx.validateAsync({
      body: {
        title: Joi.string().required(),
      },
    });

    const data = await this.service.cms.spider.create(body);
    ctx.respond(data, null, '创建成功');
  };

  async update(ctx) {
    const body = ctx.validateAsync({
      body: {
        id: Joi.number().required()
      },
    });

    const data = await this.service.cms.spider.update(body);
    ctx.respond(data, null, '更新成功');

  };

  async delete(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required()
      },
    });
    const data = await this.service.cms.spider.delete(query.id);
    ctx.respond(data, data ? 0 : 1, data ? '删除成功' : '删除失败');
  };


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

  async autoSpider(ctx) {
    const list = await this.service.cms.spider.findAll();

  }

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
