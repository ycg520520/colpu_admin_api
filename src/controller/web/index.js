/**
 * @Author: colpu
 * @Date: 2026-02-10 15:56:45
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-26 19:06:27
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
export default class WebController extends Controller {
  async menus(ctx) {
    const data = await this.service.cms.classify.tree(false, ['id', 'parent_id', 'name', 'path', 'title', 'keywords', 'description']);
    return ctx.respond(data);
  }
  async feature(ctx) {
    const data = await this.service.web.index.feature(ctx.query.type);
    return ctx.respond(data);
  }
  async site(ctx) {
    const data = await this.service.web.index.site();
    return ctx.respond(data);
  }
  async articleList(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
        category: Joi.string().required(),
      },
    });
    let data;
    try {
      data = await this.service.web.index.articleList(query);
    } catch (err) {
      ctx.throw(404, '分类路径错误');
    }
    return ctx.respond(data);
  }
  async articleDetail(ctx) {
    const query = ctx.validateAsync({
      query: {
        id: Joi.number().required(),
      },
    });
    const data = await this.service.web.index.articleDetail(query.id);
    return ctx.respond(data);
  }

  async articleListByType(ctx) {
    const query = ctx.validateAsync({
      query: {
        size: Joi.number().default(5),
        type: Joi.number().required().valid(1, 2, 3, 4).description('1头条 2推荐 3轮播 4热门').default(1),
      },
    });
    const data = await this.service.web.index.articleListByType(query);
    return ctx.respond(data);
  }

  async articleTags(ctx) {
    const data = await this.service.web.index.articleTags(ctx.query);
    return ctx.respond(data);
  }

  async getUserInfo(ctx) {
    const { uid } = ctx.state.user;
    const userInfo = await this.service.users.findUser({
      uid,
    });
    ctx.respond(userInfo);
  }

  async tagArticleList(ctx) {
    const query = ctx.validateAsync({
      query: {
        page: Joi.number().default(1),
        pageSize: Joi.number().default(20),
        id: Joi.number().required(),
      },
    });
    let data;
    try {
      data = await this.service.web.index.tagArticleList(query);
    } catch (err) {
      ctx.throw(404, '标签文章列表错误');
    }
    return ctx.respond(data);
  }
}
