/**
 * @Author: colpu
 * @Date: 2025-03-29 15:54:59
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-03-29 22:50:11
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
export default {

  // 定义转换函数
  numberTransform(numberStr, options = {}) {
    const {
      unit = '元'
    } = options;
    const tmpNumberArr = String(numberStr).split('.');
    let _change = (str, options = {}) => {
      const {
        numberUnit = ['拾', '佰', '仟', '万', '亿'],

        // numberArr = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
        numberArr = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
        move = 2
      } = options;
      let len = str.length - move;
      let tmpNumStr = str.replace(/\d/g, (c, i) => {
        const index = len - i;
        let unitStr = '';
        if (index < 4) {
          unitStr = numberUnit[index];
        } else if (index >= 4 && index < 8) {
          unitStr = numberUnit[index - 4];
        } else if (index === 8) {
          unitStr = numberUnit[4];
        }
        const number = numberArr[c];
        return `${number}${number === numberArr[0] ? '' : unitStr || ''}`;
      });
      const reg1 = new RegExp(`${numberUnit[0]}${numberArr[0]}`, 'gi');
      const reg2 = new RegExp(`([${numberUnit.join('')}])${numberArr[0]}+`, 'gi');
      return tmpNumStr.replace(reg1, numberUnit[0]).replace(reg2, `$1${numberArr[0]}`);
    };
    let str = `${_change(tmpNumberArr[0])}${unit}`;

    // 转换小数部分
    if (tmpNumberArr[1]) {
      const tmpNumber = _change(tmpNumberArr[1].substr(0, 2), {
        numberUnit: ['分', '角'],
        numberArr: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
        move: 1
      });
      str += `零${tmpNumber.replace(/零$/, '')}`;
    }
    return str;
  }
};
