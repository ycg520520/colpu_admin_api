/**
 * @Author: colpu
 * @Date: 2026-05-15 23:56:46
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-17 10:37:17
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * 虚拟支付充值套餐初始数据（`node scripts/ai.js` 且 `isSync` 时写入 colpu_ai.recharge_packages）
 */
export default [
  {
    id: 1,
    name: "体验包",
    point: 100,
    give_point: 25,
    price: 1000,
    sale_price: 1,
    enhance: 0,
    invite_refund_invitees: 0,
    sort_order: 1,
    status: 1,
  },
  {
    id: 2,
    name: "实惠包",
    point: 200,
    give_point: 150,
    price: 2000,
    sale_price: 1,
    enhance: 5,
    invite_refund_invitees: 0,
    sort_order: 2,
    status: 1,
  },
  {
    id: 3,
    name: "返现包",
    point: 300,
    give_point: 300,
    price: 3000,
    sale_price: 1,
    enhance: 5,
    tip_type: 1,
    invite_refund_invitees: 3,
    sort_order: 3,
    status: 1,
  },
  {
    id: 4,
    name: "超值包",
    point: 1500,
    give_point: 1200,
    price: 10000,
    sale_price: 9800,
    enhance: 60,
    invite_refund_invitees: 0,
    sort_order: 4,
    status: 1,
  },
];
