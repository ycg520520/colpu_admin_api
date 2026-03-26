/**
 * @Author: colpu
 * @Date: 2025-11-26 20:42:17
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-26 11:54:58
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import qs from 'qs';
// 清理数组键名
function cleanArrayKeys(obj) {
  const cleaned = {};

  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = key.replace(/\[\]$/, '');
    if (Array.isArray(value)) {
      cleaned[cleanKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      cleaned[cleanKey] = cleanArrayKeys(value);
    } else {
      cleaned[cleanKey] = value;
    }
  }

  return cleaned;
}

// 值转换函数
function convertValue(value) {
  if (Array.isArray(value)) {
    return value.map(convertValue);
  }
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    // 这里对true和false进行转换后，内部实现的query会将其转换为空值，所以这里不再处理
    // if (value === 'true') return true;
    // if (value === 'false') return false;
    // if (value === 'null') return null;
  }
  return value;
}
export default (app) => {
  // 查询参数解析中间件
  app.use(async (ctx, next) => {
    if (ctx.querystring) {
      // 解析查询参数
      const parsed = qs.parse(ctx.querystring, {
        parseArrays: true,
        comma: true,
        arrayLimit: 1000
      });

      // 清理数组键名
      const cleaned = cleanArrayKeys(parsed);

      // 转换值类型
      const converted = {};
      for (const [key, value] of Object.entries(cleaned)) {
        converted[key] = convertValue(value);
      }

      ctx.query = converted;
    }
    await next();
  });
}
