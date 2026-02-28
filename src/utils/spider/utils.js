/**
 * @Author: colpu
 * @Date: 2026-02-04 12:38:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-02-04 15:50:45
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

import fs from "fs";
import * as csv from "csv";

// 如果需要延时，可以使用原生的 setTimeout 包装
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const transformer = (dataTable) => (ipRow) => {
  try {
    const countryCode = ipRow[2].toUpperCase();
    const range = {
      ipFrom: parseInt(ipRow[0], 10),
      ipTo: parseInt(ipRow[1], 10),
    };
    const entry = dataTable[countryCode] || [];
    entry.push(range);
    dataTable[countryCode] = entry;
  }
  catch (e) {
    throw new Error(`Malformed csv entry: ${e.message}`);
  }
};
export const createDataTable = (ipLocationFilePath, dataTableFilePath) => {
  const dataTable = {};
  return new Promise((resolve, reject) => {
    const onEnd = () => {
      fs.writeFile(dataTableFilePath, JSON.stringify(dataTable), (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    };
    const onError = (err) => {
      reject(err);
    };
    fs.createReadStream(ipLocationFilePath)
      .on('error', onError)
      .pipe(csv.parse({ delimiter: ',', relax: true }))
      .on('error', onError)
      .pipe(csv.transform(transformer(dataTable)))
      .on('error', onError)
      .on('end', onEnd)
      .on('finish', onEnd);
  });
};