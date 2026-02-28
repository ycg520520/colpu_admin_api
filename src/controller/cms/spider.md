<!--
 * @Author: colpu
 * @Date: 2026-02-06 18:19:27
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-08 11:35:09
 *
 * Copyright (c) 2026 by colpu, All Rights Reserved.
-->

# 爬虫采集说明

## 列表采集代码

```javascript
// http://finance.people.com.cn/GB/70846/index{page}.html
// 暴露出来的inject参数中包含有：url,domain,params,fetch,puppeteer,cheerio,clearHtml,minify
// url是需要采集的url，即处理页码后的url；
// domain是通过url获得的域名；
// params是存储在数据库或者表单传递的参数；
// fetch,puppeteer,cheerio,clearHtml,minify是暴露出的一些方法
// 暴露出来的inject参数中包含有：url,domain,params,fetch,puppeteer,cheerio,clearHtml,minify
const { url, domain, params, fetch, puppeteer, cheerio, clearHtml, minify } =
  inject;
// 采集文章方法
async function spiderArticle(reqUrl) {
  console.log("正在采集:", reqUrl);
  // const $ = await puppeteer(reqUrl, async (res) => {
  //   return cheerio.load(await res.buffer());
  // });
  const $ = await fetch(reqUrl).then(async (res) => {
    return cheerio.load(await res.text());
  });
  const result = {
    classify_id: params.classify_id,
    title: $("h1").text(),
    keywords: $("meta[name='keywords']").attr("content"),
    description: $("meta[name='description']").attr("content"),
    content: await clearHtml($, '.rm_txt_con'),,
    author: $(".edit")
      .text()
      .replace(/\(责编：(.*)\)$/, "$1")
      .trim(),
  };
  console.log("采集结束:", reqUrl);
  return result;
}
// 采集列表方法
async function spiderList(reqUrl) {
  console.log("正在采集列表:");
  const $ = await fetch(reqUrl).then(async (res) => {
    return cheerio.load(await res.text());
  });
  const list = $(".ej_list_box .list_16 a");
  const result = [];
  const len = list.length;
  for (let i = 0; i < len; i++) {
    const item = list[i];
    const href = $(item).attr("href");
    result.push(`${domain}${href}`);
  }
  console.log("采集列表结束:", result);
  return result;
}
const result = [];
let list = [];
try {
  list = await spiderList(url);
} catch (error) {
  result.push({
    url,
    error,
  });
  console.error("采集列表失败:", url, error);
}
const len = list.length;
for (let i = 0; i < len; i++) {
  const url = list[i];
  try {
    const data = await spiderArticle(url);
    result.push({ url, data });
  } catch (error) {
    result.push({ url, error });
    console.error("采集文章失败:", url, error);
  }
}
return result;
```

## 单页采集代码

```javascript
// http://finance.people.com.cn/n1/2026/0121/c1004-40649725.html
const { url, domain, params, fetch, puppeteer, cheerio, clearHtml, minify } =
  inject;
// 采集文章方法
async function spiderArticle(reqUrl) {
  console.log("正在采集:", reqUrl);
  const $ = await fetch(reqUrl).then(async (res) => {
    return cheerio.load(await res.text());
  });
  const result = {
    classify_id: params.classify_id,
    title: $("h1").text(),
    keywords: $("meta[name='keywords']").attr("content"),
    description: $("meta[name='description']").attr("content"),
    content: await clearHtml($, '.rm_txt_con'),,
    author: $(".edit")
      .text()
      .replace(/\(责编：(.*)\)$/, "$1")
      .trim(),
  };
  console.log("采集结束:", reqUrl);
  return result;
}
const result = [];
try {
  const data = await spiderArticle(url);
  result.push({ url, data });
} catch (error) {
  result.push({ url, error });
  console.error("采集文章失败:", url, error);
}
return result;
```
