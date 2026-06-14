/**
 * @Author: colpu
 * @Date: 2026-03-30 22:19:49
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-05 17:17:21
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import OSS from 'ali-oss';
import { Readable } from 'stream';
import fetcher from "./fetcher.js";
export default class AliOSS {
  constructor(option) {
    if (!option) throw new Error('oss is required');
    this.accessKeyId = option.accessKeyId;
    this.accessKeySecret = option.accessKeySecret;
    this.uploadPath = option.uploadPath || 'upload/';
    this.client = new OSS(option);
  }
  async uploads(images) {
    if (images.length === 0) return [];
    const uploadPromises = images.map(image => {
      const filename = `${this.uploadPath}${image.split('/').pop().split('?').shift()}`;
      return this.upload(image, filename);
    });
    return Promise.all(uploadPromises);
  }  /**
     * 使用 fetch 流式上传网络图片到 OSS
     * @param {string} src - 图片的网络地址
     * @param {string} filename - OSS上的保存路径 (例如: 'images/avatar.jpg')
     */
  async upload(src, filename) {
    try {
      console.log("开始上传图片:", src);
      // 1. 发起请求获取图片
      const response = await fetcher(src, { isOrigin: true, method: "GET" });
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.statusText}`);
      }
      // 2. 获取流对象
      const stream = Readable.from(response.body);
      // 4. 上传到 OSS
      // 阿里云 SDK 的 put 方法支持直接传入 Stream
      const result = await this.client.put(filename, stream);
      console.log('上传成功:', result.name);
      return result.name;
    } catch (error) {
      console.error('上传过程出错:', error);
      // 这里不抛出错误，避免中断其他上传
      // throw error;
      return Promise.reject(error);
    }
  }
}
