/**
 * @Author: colpu
 * @Date: 2026-06-24 09:04:34
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-24 16:41:56
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import fetcher from './fetcher.js';
import FormData from 'form-data';
// 暂未完成，详见：https://123yunpan.yuque.com/org-wiki-123yunpan-muaork/cr6ced
class Yun123 {
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
      const data = new FormData();
      data.append('filename', filename);
      data.append('file', stream);
      data.append('parentFileID', '11522394');
      data.append('etag', '511215951b857390c3f30c17d0dae8ee');
      data.append('size', '35763200');
      const result = await fetcher('https://openapi-upload.123242.com/upload/v2/file/single/create', {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1...(过长省略)',
          'Platform': 'open_platform',
          ...data.getHeaders()
        },
        data: data
      })
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
