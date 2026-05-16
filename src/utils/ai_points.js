/**
 * 与小程序 `composeResolutions` 一致：仅当存在「超高清」价差时按 body.size 与 classify.size_hd 比较。
 * @param {object} classify Sequelize 行或 plain object
 * @param {object} body generate 请求体（含 size）
 * @returns {number}
 */
export function resolveConsumePoint(classify, body) {
  const cp = Number(classify?.cost_point) || 0;
  const cph = Number(classify?.cost_point_hd) || 0;
  if (cp === cph) return cp;
  const reqSize = body?.size ?? classify?.size;
  const hdSize = classify?.size_hd;
  return reqSize === hdSize ? cph : cp;
}
