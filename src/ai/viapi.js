/**
 * @Author: colpu
 * @Date: 2026-03-30 21:15:31
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-09 17:10:21
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

import { Config } from '@alicloud/openapi-client';
import ImageenhanClient, { GenerateSuperResolutionImageRequest, MakeSuperResolutionImageRequest, EnhanceImageColorRequest, ColorizeImageRequest } from '@alicloud/imageenhan20190930';
import ViapiClient, { GetAsyncJobResultRequest } from '@alicloud/viapi20230117';
import { RuntimeOptions } from '@alicloud/tea-util';
import AliOSS from "./alioss.js";
export const VIAPI_FUN = new Set([
  "generateSuperResolutionImage",
  "makeSuperResolutionImage",
  "colorizeImage",
  "enhanceImageColor",
  "faceEnhance",
]);
export default class AliViapi {
  constructor(option) {
    if (!option) {
      throw new Error('缺少option配置');
    }
    this.accessKeyId = option.accessKeyId;
    this.accessKeySecret = option.accessKeySecret;
    this.config = new Config({
      accessKeyId: option.accessKeyId,
      accessKeySecret: option.accessKeySecret,
    });
    this.runtime = new RuntimeOptions({});
    this.ossClient = new AliOSS(option);
  }
  /**
   * @function generateSuperResolutionImage 生成式图像超分
   * @description
   * 基于生成式大模型，对图像分辨率进行细节增强、图像修复以及倍数放大，显著提升图像细节丰富度，使图像变得更加清晰。相比标准版图像超分算法，具有更加真实、更自然的细节生成能力。
   * @see https://help.aliyun.com/zh/viapi/developer-reference/api-generated-image-super-score?spm=a2c4g.11186623.help-menu-142958.d_4_3_7_1_0.229e4865hyOPH8
   * @param {object} data
   * @param {string} data.imageUrl 输入图片地址。推荐使用上海地域的OSS链接，对于文件在本地或者非上海地域OSS链接的情况，[请参见文件URL处理](https://help.aliyun.com/zh/viapi/getting-started/the-file-url-processing?spm=a2c4g.11186623.0.0.50d948654yZ8VC)。
   * @param {number} [data.scale] 图像放大倍数。支持1，2，3，4，默认为2。
   * @param {string} [data.userData] 该参数为接口保留字段，默认不需要填写。
   * @param {string} [data.outputFormat] 输出图像的存储格式。取值范围：png、jpg、bmp，默认png。
   * @param {number} [data.outputQuality] 输出图像的质量因子，值越大质量越高。取值范围[30,100]，默认95，仅当outputFormat为jpg时有效。
   * @returns {Promise<object>} 返回一个Promise对象，解析后包含以下字段：
   * - task_id: 任务ID，用于查询任务结果
   * - model: 使用的操作名称，固定为generateSuperResolutionImage
    * - 其他字段根据接口返回结果而定
    * @throws {Error} 如果请求参数不合法或者接口调用失败，将抛出一个Error对象，包含错误信息
   * @example
   * const viapi = new AliViapi({ accessKeyId: 'your-access-key-id', accessKeySecret: 'your-access-key-secret' });
   * viapi.generateSuperResolutionImage({ imageUrl: 'https://example.com/image.png', scale: 4, outputFormat: 'jpg', outputQuality: 90 })
   *   .then(result => console.log(result))
   *   .catch(error => console.error(error));
   */
  async generateSuperResolutionImage(data) {
    const { imageUrl, ...reset } = data;
    const params = new GenerateSuperResolutionImageRequest({
      imageUrl,
      ...reset,
    });
    this.config.endpoint = 'imageenhan.cn-shanghai.aliyuncs.com';
    const client = new ImageenhanClient.default(this.config);
    return client.generateSuperResolutionImageWithOptions(params, this.runtime).then(res => {
      return {
        ...res.body,
        task_id: res.body.requestId,
        model: "generateSuperResolutionImage"
      }
    });
  }

  /**
   * @function makeSuperResolutionImage 图像超分
   * @description
   * 图像超分在放大图像分辨率的同时，提升图像细节纹理，降低图像噪声，支持1-4倍分辨率放大，支持原分辨率增强，支持多种模式不同效果的输出。
   * @see https://help.aliyun.com/zh/viapi/developer-reference/api-px24vm?spm=a2cw1.28085198.console-base_help.dexternal.357d143fj7UAZt
   * @param {object} data
   * @param {string} data.url 图像URL地址，必须是公网可访问的URL，支持HTTP/HTTPS协议
   * @param {string} [data.mode] 超分辨率模式，默认为base，支持base和advanced两种模式
   * @param {number} [data.upscaleFactor] 放大倍数，默认为2，支持2、4两种倍数
   * @param {string} [data.outputFormat] 输出图像格式，默认为png，支持png和jpg两种格式
   * @param {number} [data.outputQuality] 输出图像质量，仅当outputFormat为jpg时有效，默认为95，取值范围为1-100
   * @returns {Promise<object>} 返回一个Promise对象，解析后包含以下字段：
   * - task_id: 任务ID，用于查询任务结果
   * - model: 使用的操作名称，固定为makeSuperResolutionImage
    * - 其他字段根据接口返回结果而定
    * @throws {Error} 如果请求参数不合法或者接口调用失败，将抛出一个Error对象，包含错误信息
   * @example
   * const viapi = new AliViapi({ accessKeyId: 'your-access-key-id', accessKeySecret: 'your-access-key-secret' });
   * viapi.makeSuperResolutionImage({ url: 'https://example.com/image.png', mode: 'advanced', upscaleFactor: 4, outputFormat: 'jpg', outputQuality: 90 })
   *   .then(result => console.log(result))
   *   .catch(error => console.error(error));
   */
  async makeSuperResolutionImage(data) {
    const { url, ...reset } = data;
    const params = new MakeSuperResolutionImageRequest({
      url,
      ...reset,
    });
    this.config.endpoint = 'imageenhan.cn-shanghai.aliyuncs.com';
    const client = new ImageenhanClient.default(this.config);
    return client.makeSuperResolutionImageWithOptions(params, this.runtime).then(async res => {
      const body = res.body;
      const images = await this.ossClient.uploads([body.data.url]);
      return {
        images,
        output: body.data,
        task_id: body.requestId,
        task_status: 'SUCCEEDED',
        model: "makeSuperResolutionImage"
      }
    });
  }
  /**
   * @function enhanceImageColor 图像色彩增强
   * @description
   * 图像色彩增强能力可以对输入图像进行智能内容分析，根据图像内容自动调整参数，对图像饱和度、亮度、对比度等多个维度进行优化，输出增强后的图像。
   * @see https://help.aliyun.com/zh/viapi/use-cases/image-color-enhancement-1?spm=a2c4g.11186623.help-menu-142958.d_2_5_1.1d32ec14ZuD4MD&scm=20140722.H_601517._.OR_help-T_cn~zh-V_1#m7lxD
   * @param {object} data
   * @param {string} data.imageUrl 输入图片地址。推荐使用上海地域的OSS链接，对于文件在本地或者非上海地域OSS链接的情况，[请参见文件URL处理](https://help.aliyun.com/zh/viapi/getting-started/the-file-url-processing?spm=a2c4g.11186623.0.0.50d948654yZ8VC)。
   * @param {string} [data.mode] 增强模式，默认为LogC，支持LogC、HDR等多种模式，适用于不同类型的图像和应用场景
   * @param {string} [data.outputFormat] 输出图像的存储格式。取值范围：png、jpg、bmp，默认png。
   * @returns {Promise<object>} 返回一个Promise对象，解析后包含以下字段：
   * - task_id: 任务ID，用于查询任务结果
   * - model: 使用的操作名称，固定为enhanceImageColor
    * - 其他字段根据接口返回结果而定
    * @throws {Error} 如果请求参数不合法或者接口调用失败，将抛出一个Error对象，包含错误信息
   * @example
   * const viapi = new AliViapi({ accessKeyId: 'your-access-key-id', accessKeySecret: 'your-access-key-secret' });
   * viapi.enhanceImageColor({ imageUrl: 'https://example.com/image.png', mode: 'LogC', outputFormat: 'png' })
   *   .then(result => console.log(result))
   *   .catch(error => console.error(error));
   */
  async enhanceImageColor(data) {
    const { imageUrl, ...reset } = data;
    const params = new EnhanceImageColorRequest({
      imageURL: imageUrl,
      mode: "LogC",
      outputFormat: "png",
      ...reset,
    });
    this.config.endpoint = 'imageenhan.cn-shanghai.aliyuncs.com';
    const client = new ImageenhanClient.default(this.config);
    return client.enhanceImageColorWithOptions(params, this.runtime).then(async res => {
      const body = res.body;
      const images = await this.ossClient.uploads([body.data.imageURL]);
      return {
        images,
        output: body.data,
        task_id: body.requestId,
        task_status: 'SUCCEEDED',
        model: "enhanceImageColor"
      }
    });
  }
  /**
   * @function colorizeImage 图片上色
   * @description
   * 图片上色能力可以对黑白照片、黑白图像自动上色。
   * @param {object} data
   * @param {string} data.imageUrl 输入图片地址。推荐使用上海地域的OSS链接，对于文件在本地或者非上海地域OSS链接的情况，[请参见文件URL处理](https://help.aliyun.com/zh/viapi/getting-started/the-file-url-processing?spm=a2c4g.11186623.0.0.50d948654yZ8VC)。
   * @returns {Promise<object>} 返回一个Promise对象，解析后包含以下字段：
   * - task_id: 任务ID，用于查询任务结果
   * - model: 使用的操作名称，固定为colorizeImage
    * - 其他字段根据接口返回结果而定
    * @throws {Error} 如果请求参数不合法或者接口调用失败，将抛出一个Error对象，包含错误信息
   * @example
   * const viapi = new AliViapi({ accessKeyId: 'your-access-key-id', accessKeySecret: 'your-access-key-secret' });
   * viapi.colorizeImage({ imageUrl: 'https://example.com/image.png' })
   *   .then(result => console.log(result))
   *   .catch(error => console.error(error));
   */
  async colorizeImage(data) {
    const { imageUrl } = data;
    const params = new ColorizeImageRequest({
      imageURL: imageUrl,
    });
    this.config.endpoint = 'imageenhan.cn-shanghai.aliyuncs.com';
    const client = new ImageenhanClient.default(this.config);
    return client.colorizeImageWithOptions(params, this.runtime).then(async res => {
      const body = res.body;
      const images = await this.ossClient.uploads([body.data.imageURL]);
      return {
        images,
        output: body.data,
        task_id: body.requestId,
        task_status: 'SUCCEEDED',
        model: "colorizeImage"
      }
    });
  }

  async getResult(task_id) {
    this.config.endpoint = 'viapi.cn-shanghai.aliyuncs.com';
    const client = new ViapiClient.default(this.config);
    const getAsyncJobResultRequest = new GetAsyncJobResultRequest({ jobId: task_id });
    const res = await client.getAsyncJobResultWithOptions(getAsyncJobResultRequest, this.runtime).then(res => res.body.data);

    const { status, result } = res;
    let images = [];
    let task_status = status;
    let output;
    if (task_status === 'PROCESS_SUCCESS') {
      output = JSON.parse(result);
      const uploadImages = this.getImages(output);
      images = await this.ossClient.uploads(uploadImages);
      task_status = 'SUCCEEDED'
    } else {
      output = {}
    }
    return { task_id, task_status, output, images };
  }
  getImages(output) {
    if (output.resultUrl) {
      return [output.resultUrl];
    }
    return [];
  }
}
