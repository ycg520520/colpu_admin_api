/**
 * @Author: colpu
 * @Date: 2026-03-30 22:12:10
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-24 09:09:35
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
export default async function fetcher(url, ...args) {
  if (!url || typeof url !== 'string') {
    throw new Error(`Invalid URL: ${url}`);
  }
  let option = {}
  let data;
  if (args.length == 1) {
    const { body, ...reset } = args[0] || {}
    if (body) {
      data = body;
    }
    option = reset;
  } else if (args.length == 2) {
    data = args[0] || {}
    option = args[1] || {}
  }
  const { headers = {}, isOrigin = false, ...reset } = option;
  const config = {
    method: 'POST',
    headers: isOrigin ? headers : {
      'Content-Type': 'application/json',
      ...headers
    },
    ...reset,
  }
  if (data) {
    config.body = JSON.stringify(data);
  }
  let response;
  try {
    if (config.method === 'GET') {
      console.log('GET', url, config);
    }
    response = await fetch(url, config);
  } catch (err) {
    return Promise.reject(err);
  }
  if (isOrigin) {
    return response;
  }
  // 错误状态码
  if (!response.ok) {
    return response.text();
  }
  return response.json();
}
