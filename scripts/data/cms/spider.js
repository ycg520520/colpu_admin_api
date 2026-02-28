/**
 * @Author: colpu
 * @Date: 2026-02-08 11:39:27
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-08 12:03:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved. 
 */
export default [
  {
    "classify_id": 4,
    "title": "人民网新闻采集",
    "url": "http://finance.people.com.cn/GB/70846/index{page}.html",
    "schedule": null,
    "start_page": "1",
    "end_page": "1",
    "parse_data": "const { url, domain, params, fetch, puppeteer, cheerio, clearHtml, minify } =\n  inject;\n// 采集文章方法\nasync function spiderArticle(reqUrl) {\n  console.log(\"正在采集:\", reqUrl);\n  // const $ = await puppeteer(reqUrl, async (res) => {\n  //   return cheerio.load(await res.buffer());\n  // });\n  const $ = await fetch(reqUrl).then(async (res) => {\n    return cheerio.load(await res.text());\n  });\n  const result = {\n    classify_id: params.classify_id,\n    title: $(\"h1\").text(),\n    keywords: $(\"meta[name='keywords']\").attr(\"content\"),\n    description: $(\"meta[name='description']\").attr(\"content\"),\n    content: await clearHtml($, '.rm_txt_con'),\n    author: $(\".edit\")\n      .text()\n      .replace(/\\(责编：(.*)\\)$/, \"$1\")\n      .trim(),\n  };\n  console.log(\"采集结束:\", reqUrl);\n  return result;\n}\n// 采集列表方法\nasync function spiderList(reqUrl) {\n  console.log(\"正在采集列表:\");\n  const $ = await fetch(reqUrl).then(async (res) => {\n    return cheerio.load(await res.text());\n  });\n  const list = $(\".ej_list_box .list_16 a\");\n  const result = [];\n  const len = list.length;\n  for (let i = 0; i < len; i++) {\n    const item = list[i];\n    const href = $(item).attr(\"href\");\n    result.push(`${domain}${href}`);\n  }\n  console.log(\"采集列表结束:\", result);\n  return result;\n}\nconst result = [];\nlet list = [];\ntry {\n  list = await spiderList(url);\n} catch (error) {\n  result.push({\n    url,\n    error,\n  });\n  console.error(\"采集列表失败:\", url, error);\n}\nconst len = list.length;\nfor (let i = 0; i < len; i++) {\n  const url = list[i];\n  try {\n    const data = await spiderArticle(url);\n    result.push({ url, data });\n  } catch (error) {\n    result.push({ url, error });\n    console.error(\"采集文章失败:\", url, error);\n  }\n}\nreturn result;"
  },
  {
    "classify_id": 4,
    "title": "详情页面单页采集",
    "url": "http://finance.people.com.cn/n1/2026/0121/c1004-40649725.html",
    "schedule": null,
    "start_page": "0",
    "end_page": "0",
    "parse_data": "const { url, domain, params, fetch, puppeteer, cheerio, clearHtml, minify } =\n  inject;\n// 采集文章方法\nasync function spiderArticle(reqUrl) {\n  console.log(\"正在采集:\", reqUrl);\n  const $ = await fetch(reqUrl).then(async (res) => {\n    return cheerio.load(await res.text());\n  });\n  const result = {\n    classify_id: params.classify_id,\n    title: $(\"h1\").text(),\n    keywords: $(\"meta[name='keywords']\").attr(\"content\"),\n    description: $(\"meta[name='description']\").attr(\"content\"),\n    content: await clearHtml($, '.rm_txt_con'),\n    author: $(\".edit\")\n      .text()\n      .replace(/\\(责编：(.*)\\)$/, \"$1\")\n      .trim(),\n  };\n  console.log(\"采集结束:\", reqUrl);\n  return result;\n}\nconst result = [];\ntry {\n  const data = await spiderArticle(url);\n  result.push({ url, data });\n} catch (error) {\n  result.push({ url, error });\n  console.error(\"采集文章失败:\", url, error);\n}\nreturn result;"
  }
]