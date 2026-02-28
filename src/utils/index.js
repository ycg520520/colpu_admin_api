import { minify } from "html-minifier-terser";
export { minify };
/**
 * [numberToUnitStr 数字转换单位字符串]
 * @param  {[Number]} number [description]
 * @return {[Number]}        [description]
 *
 */
export function numberToUnitStr(number) {
  if (!number) {
    number = 0;
  }
  if (number === 0) {
    number = Math.random() * 1000000;
  }
  number = parseInt(number, 10);

  // 数值显示规则（四舍五入，新规则）：

  if (number >= 1e10) {
    // 1百亿及以上 显示为xxx亿，如：123亿（12345678901）
    return parseInt(number / 1e8, 10) + "亿";
  } else if (number >= 1e8) {
    // 1亿到1百亿 显示成xx.x亿，如：12.3亿（1234567890）
    return (number / 1e8).toFixed(1) + "亿";
  } else if (number >= 1e6) {
    // 100万到1亿之间显示成xxx万，如：1234万（12345678）
    return parseInt(number / 1e4, 10) + "万";
  } else if (number >= 1e5) {
    // 10万到100万之间，显示成xx.x万，如：12.3万（123456
    return (number / 1e4).toFixed(1) + "万";
  }

  // 10万以内直接显示 如：12345
  return number;
}

/**
 * [toDate 任意对象转日期高度容错]
 * @param  {[Object]} obj [要转换的日期]
 * @return {[type]}     [description]
 */
export function toDate(obj) {
  if (
    obj instanceof Date ||
    Object.prototype.toString.call(obj) === "[object Date]"
  ) {
    return new Date(obj);
  } else if (!isNaN(obj)) {
    return new Date(parseInt(obj, 10)); // 数字或数字字符串转日期
  } else if (!isNaN(Date.parse(obj))) {
    return new Date(Date.parse(obj)); // UTC格式字符串转日期
  }
  return new Date(); // null, undefined, 0, '' 均返回当前时间
}

/**
 * [formatDate 格式化显示日期时间]
 * @param  {[String | Number]} date [待显示的日期时间，可以为数字形式]
 * @param  {[String]} fmt [需要显示的格式，例如yyyy-MM-dd hh:mm:ss]
 * @return {[String]}   [格式化好的时间]
 */
export function formatDate(date, fmt) {
  date = toDate(date); // 保证date是日期类型(时间戳或UTC字符串转日期)
  if (!fmt) {
    fmt = "yyyy-MM-dd hh:mm:ss";
  }
  const o = {
    y: date.getFullYear(),
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
  };
  try {
    return fmt.replace(/(y+|M+|d+|h+|m+|s+)/g, function (item) {
      const len = item.length;

      return ((len > 1 ? "0" : "") + o[item.slice(-1)]).slice(
        -(len > 2 ? len : 2)
      );
    });
  } catch (e) {
    console.error(e);
    return "";
  }
}

/**
 * 1s = 1000ms
 * 1m = 60 * 1000ms
 * 1h = 60 * 60 * 1000
 * 1d = 24 * 60 * 60 * 1000
 *
 * [getTimeSpan 转换阶梯时间]
 * @param  {[Number]} timestamp [时间戳]
 * @param  {[String]} fmt [需要显示的格式，例如yyyy-MM-dd hh:mm:ss]
 * @return {[String]}      [转换后的时间字符串]
 */
export function getTimeSpan(timestamp, fmt) {
  timestamp = parseInt(timestamp, 10);
  if (timestamp.toString().length === 10) {
    timestamp = timestamp * 1000;
  }
  const nowDate = new Date();
  const current = nowDate.getTime();
  const differe = current - timestamp; // 差值
  // const aYearAgo = new Date(nowDate)  // 从当前时间前置一年，获取到当时的时间戳
  // aYearAgo.setFullYear(nowDate.getFullYear() - 1);

  // if (aYearAgo.getTime() > timestamp) {
  // 	// 大于一年前，显示yyyy.mm.dd（例：2016.05.20）
  // 	return formatDate(timestamp, 'yyyy.mm.dd');
  // }
  if (differe > 0) {
    if (differe > 864e6) {
      // 10天前，显示mm.dd hh: mm（例：04.05 16:05）
      // return formatDate(timestamp, 'mm.dd hh:mm')
      return formatDate(timestamp, fmt || "yyyy.MM.dd");
    } else if (differe > 2592e5) {
      // 小于10天（含10天），显示x天前；
      return parseInt(differe / 864e5, 10) + "天前";
    } else if (differe > 1728e5) {
      // 2天到3天之前前天；
      return "前天";
    } else if (differe > 864e5) {
      // 1天到2天之间，显示昨天；
      return "昨天";
    } else if (differe > 36e5) {
      // 小于一天，显示x小时前；
      return parseInt(differe / 36e5, 10) + "小时前";
    } else if (differe > 6e4) {
      // 小于1小时，显示x分钟前；
      return parseInt(differe / 6e4, 10) + "分钟前";
    }

    // 小于1分钟，显示“刚刚”；
    return "刚刚";
  } else {
    return formatDate(timestamp, fmt || "yyyy.MM.dd");
  }
}

/**
 * @function zeroize 数字补零
 * @param {Number} number
 */
export function zeroize(number) {
  return number >= 10 ? number : (number = "0" + number);
}

/**
 * @function getType
 * @param {Object} origin 原始数据
 * @param {String} type 数据类型 string,number,boolean,undefined,null,object,array,function
 * @return {String} 返回数据类型string,number,boolean,undefined,null,object,array,function
 */
export function getType(origin) {
  const originType = Object.prototype.toString.call(origin);
  const len = originType.length;
  return originType.substring(8, len - 1).toLowerCase();
}

/**
 * @function installTree 组装树
 * @param {Array} data 要处理的树数组
 * @param {Object} options 默认配置
 */
export function installTree(data = [], options = {}) {
  let {
    id = 0,
    mode = 'tree', // mode: tree, object, array
    key_id = 'id',
    key_fid = 'fid'
  } = options;
  id = parseInt(id, 10);
  if (id === 0 && mode === 'array') {
    return data;
  }
  const dict = {},
    filterItem = [];

  // 组装到字典
  data.forEach(item => {
    dict[item[key_id]] = item;
  });
  if (id === 0 && mode === 'object') {
    return dict;
  }
  for (let i in dict) {
    const item = dict[i];
    const father = item[key_fid];
    const fatherData = dict[father];
    if (father > 0 && fatherData) {
      if (!fatherData.children) {
        fatherData.children = [];
      }
      fatherData.children.push(item);
    }
  }

  let result = [];
  for (let i in dict) {
    const item = dict[i];
    if ((item[key_fid] === id && id == 0) || item[key_id] === id) {
      filterItem.push(item);
      result.push(item);
    }

    // delete item[key_fid];
  }
  const loop = (arr, res) => {
    arr.forEach(v => {
      const k = v[key_id];
      const item = dict[k];
      if (item.children) {
        loop(item.children, res);
      }

      delete item.children;
      if (mode === 'object') {
        res[k] = item;
      } else if (mode === 'array') {
        res.push(item);
      }
    });
  };
  if (mode !== 'tree') {
    let res = mode === 'object' ? {} : [];
    loop(filterItem, res);
    return res;
  }

  return result;
}

export function setURL(url, params = {}, baseUrl) {
  const uri = new URL(url, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      uri.searchParams.set(key, value);
    }
  });
  return uri;
}

export async function clearHtml($, select) {
  // 移除掉不需要的表器
  $('script, link, style, noscript, iframe').remove();
  const html = $(select);
  const htmlAll = html.find('*');
  // 移除所有的 style、class、id 属性
  htmlAll.removeAttr('style class id');
  // 移除空标签
  // 1. 遍历页面上所有的元素
  // '*' 代表选择所有元素
  htmlAll.each((index, element) => {
    const $elem = $(element);
    // 2. 获取元素的文本内容，并去除首尾空白
    // 注意：这里只检查文本，不检查子标签
    const text = $elem.text().trim();
    // 3. 如果文本为空，则移除该元素
    // 注意：这不会移除包含子标签（即使子标签为空）的元素，除非你使用 .html().trim()
    if (text === '') {
      $elem.remove();
    }
  });
  htmlAll.contents().filter(function () {
    return this.type === 'text' && !this.nodeValue.trim();
  }).remove();
  // 删除掉多余的标签
  $('p>span,div>span,p>em,div>em,p>strong,div>strong').each((i, el) => {
    if (!el.attribs || Object.keys(el.attribs).length === 0) {
      $(el).contents().unwrap();
    }
  });
  let htmlStr = html.html();
  htmlStr = await minify(htmlStr, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeTagWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  });
  return htmlStr;
}