/**
 * @Author: colpu
 * @Date: 2023-02-08 15:32:39
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-04 17:38:37
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import fakeUa from 'fake-useragent';
export default (url, options = {}) => {
  try {
    return fetch(url, {
      ...options,
      headers: {
        "Accept-Language": "zh-CN,zh;q=0.9",
        'Referer': url,
        ...options.headers,
        'User-Agent': fakeUa(),
      },
    });
  } catch (error) {
    throw Error(error);
  }
}
