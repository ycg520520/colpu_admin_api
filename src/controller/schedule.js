/**
 * @Author: colpu
 * @Date: 2023-02-08 15:32:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-08 22:37:01
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved. 
 */
import schedule from "node-schedule";
import Joi from "joi";
import { Controller } from "@colpu/core";
const scheduleTaskMap = {};
export default class ScheduleController extends Controller {
  /**
   * @param {String} event 启动事件 start|stop
   * @param {String} [rule] 定时规则 (可选)
   * @param {String} url 启动地址
   * @param {String} url 启动地址
   * 使用方法: domain:port/schedule?event=start|stop&url=''&rule='* * * * * *'
   */
  async launch(ctx) {
    const query = ctx.validateAsync({
      query: {
        event: Joi.string().required(), // 操作事件
        url: Joi.string().required(), // 要启动的请求地址
        rule: Joi.string().optional().allow("", null), // 启动规则
      },
    });
    const { event, url, rule } = query;
    if (event === 'start') {
      if (!scheduleTaskMap[url]) {
        console.log(`启动定时任务~`);
        const scheduleTask = schedule.scheduleJob(rule ? rule : '* * * * * *', async () => {
          const startTime = Date.now();
          console.log(`定时任务开始运行::`, url, startTime);
          if (!rule) {
            scheduleTask.cancel();
            delete scheduleTaskMap[url];
          }
          const { authorization } = ctx.headers;
          ctx.app.axios.get(url, {
            headers: {
              authorization
            },
            timeout: 0
          });
          console.log(`定时任务完成运行::`, url, Date.now() - startTime);
        });
        scheduleTaskMap[url] = scheduleTask;
        ctx.respond({ ...query, message: '启动定时任务成功~' });
      } else {
        ctx.respond({ ...query, message: '不要重复启动^_^' });
      }
    } else if (event === 'stop') {
      if (scheduleTaskMap[url]) {
        scheduleTaskMap[url].cancel();
        delete scheduleTaskMap[url];
        ctx.respond({ ...query, message: '已经停止定时任务了~' });
      } else {
        ctx.respond({ ...query, message: '抱歉，您还没启动定时任务~' });
      }
    } else {
      ctx.throw(400, '请求参数不正确');
    }
  }
};
