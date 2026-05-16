/**
 * 虚拟支付充值套餐初始数据（`node scripts/ai.js` 且 `isSync` 时写入 colpu_ai.recharge_packages）
 */
export default [
  {
    id: 1,
    name: "体验包",
    point: 125,
    price: 1000,
    sale_price: 980,
    enhance: 0,
    sort_order: 1,
    status: 1,
  },
  {
    id: 2,
    name: "实惠包",
    point: 300,
    price: 1,
    sale_price: 1,
    enhance: 5,
    sort_order: 2,
    status: 1,
  },
  {
    id: 3,
    name: "超值包",
    point: 1500,
    price: 10000,
    sale_price: 9800,
    enhance: 60,
    sort_order: 3,
    status: 1,
  },
];
