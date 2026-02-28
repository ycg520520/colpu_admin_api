/**
 * @Author: colpu
 * @Date: 2025-12-15 16:28:34
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-25 18:21:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default [{
  id: 1,
  name: '首页',
  type: 0,
  template: 'home',
  path: '/',
  code: 'home',
  editable: 1
},
{
  id: 2,
  name: '新闻资讯',
  type: 0,
  path: '/news',
  code: 'news',
  template: 'news'
},
{
  id: 3,
  parent_id: 2,
  name: '技术文章',
  type: 1,
  path: '/news/jswz',
  code: 'jswz',
  template: 'news_list'
},
{
  id: 4,
  name: '文档',
  type: 1,
  path: '/doc',
  code: 'doc',
  template: 'news_list'
},
{
  id: 5,
  name: '图片',
  type: 1,
  path: '/pic',
  code: 'pic',
  status: 0,
  template: 'news_list'
},
{
  id: 6,
  name: '视频',
  type: 1,
  path: '/video',
  code: 'video',
  status: 0,
  template: 'news_list'
},
{
  id: 7,
  name: '下载',
  type: 1,
  path: '/download',
  code: 'download',
  status: 0,
  template: 'news_list'
},
{
  id: 8,
  name: '专题',
  type: 1,
  path: '/special',
  code: 'special',
  status: 0,
  template: 'news_list'
},
{
  id: 9,
  name: '关于我们',
  type: 1,
  path: '/about',
  code: 'about',
  template: 'single_list'
},
];
