/**
 * @Author: colpu
 * @Date: 2026-02-04 12:30:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-05 15:47:11
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import fakeUa from 'fake-useragent';
import puppeteer from 'puppeteer';
import { wait } from './utils.js';
export default async (url, callback) => {
  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true, // 生产环境建议开启无头模式
      args: [
        // `--proxy-server=http://127.0.0.1:7890`, // 👈 设置代理的核心参数
        '--ignore-certificate-errors', // 忽略证书错误
        '--allow-insecure-localhost', // 允许本地加载不安全的 HTTPS 资源
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled', // 隐藏自动化特征
      ],
      // dumpio: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent({ userAgent: fakeUa() }); // 设置随机User-Agent

    const response = await page.goto(url, { waitUntil: 'networkidle2' }); // 等待页面加载完成

    // 随机延时，模拟人类行为 (防封)
    await wait(Math.floor(Math.random() * 2000) + 1000);
    return callback ? await callback(response, page) : await response.content();
  } catch (error) {
    console.error('爬取过程中发生错误:', error);
    throw new Error(error);
  } finally {
    if (browser) await browser.close();
  }
};
