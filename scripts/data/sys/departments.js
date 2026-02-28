/**
 * @Author: colpu
 * @Date: 2025-03-18 15:40:49
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-23 23:03:05
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default [{
  id: 1,
  name: '公司总部',
  code: 'headquarters',
}, {
  id: 2,
  parent_id: 1,
  name: '北京分公司',
  code: 'beijing'
}, {
  id: 3,
  parent_id: 2,
  name: '财务部',
  code: 'bj:finance'
},
{
  id: 4,
  parent_id: 2,
  name: '人事部',
  code: 'bj:hr'
}, {
  id: 5,
  parent_id: 2,
  name: '市场部',
  code: 'bj:marketing'
}, {
  id: 6,
  parent_id: 2,
  name: '技术部',
  code: 'bj:tech'
}, {
  id: 7,
  parent_id: 2,
  name: '运维部',
  code: 'bj:operations'
}, {
  id: 8,
  parent_id: 1,
  name: '成都分公司',
  code: 'chengdu'
}, {
  id: 9,
  parent_id: 8,
  name: '财务部',
  code: 'cd:finance'
}, {
  id: 10,
  parent_id: 8,
  name: '人事部',
  code: 'cd:hr'
}, {
  id: 11,
  parent_id: 8,
  name: '市场部',
  code: 'cd:marketing'
}, {
  id: 12,
  parent_id: 8,
  name: '技术部',
  code: 'cd:tech'
}, {
  id: 13,
  parent_id: 8,
  name: '运维部',
  code: 'cd:operations'
}];
