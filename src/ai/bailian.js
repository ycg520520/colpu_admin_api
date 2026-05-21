/**
 * @Author: colpu
 * @Date: 2026-03-30 21:59:47
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-21 09:18:34
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
// 阿里百炼服务平台，包括千问、万相
import fetcher from "./fetcher.js";
import AliOSS from "./alioss.js";
export const BAILIAN_MODELS = {
  'wan2.5-i2i-preview': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis',
  'wan2.6-image': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation', // 异步
  'wan2.7-image': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation', // 异步
};
export default class Bailian {
  // 模型列表
  constructor(option) {
    if (!option.apikey) throw new Error('apikey is required');
    const ossOption = option.ossOption;
    if (!ossOption) {
      throw new Error('缺少ossOption配置');
    }
    this.apikey = option.apikey;
    this.ossClient = new AliOSS(ossOption);
    this.headers = {
      'Authorization': 'Bearer ' + this.apikey,
    }
  }
  async generate(data) {
    const { url, body, headers } = this.getModelData(data);
    return fetcher(url, body, { headers }).then(({ output, ...reset }) => {
      const { model, ...resetBody } = body;
      return {
        output,
        model,
        task_status: output.task_status,
        task_id: output.task_id,
        ...resetBody,
        ...reset,
      }
    });
  }
  async getResult(task_id) {
    console.log(task_id);
    const res = await fetcher(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
      method: 'GET',
      headers: {
        ...this.headers
      }
    });
    const { output, ...reset } = res;
    const { task_status } = output || {};
    let images = [];
    if (task_status === 'SUCCEEDED') {
      const uploadImages = this.getImages(output);
      images = await this.ossClient.uploads(uploadImages) || [];
    }
    return { task_id, task_status, output, images, ...reset };
  }

  getImages(output) {
    if (output.choices) {
      const images = output.choices.map(item => {
        return item.message.content.filter(i => i.type === 'image').map(i => i.image);
      });
      return images.flat();
    }
    return [];
  }

  getModelData(data) {
    let { model, prompt, images, parameters = {} } = data;
    const url = BAILIAN_MODELS[model] || BAILIAN_MODELS['wan2.6-image'];
    const headers = { ...this.headers };
    let body;
    if (images.length > 1) {
      images = [images[0]];
    }
    switch (model) {
      case 'wan2.6-image':
      case 'wan2.7-image':
        body = this.wanImage(model, prompt, images, parameters);
        headers['X-DashScope-Async'] = 'enable';   // 流式请求头
        break;
      case 'wan2.6-image-v2':
      default:
        body = this.wan2_5_i2iPreview(model, prompt, images);
        break;
    }
    return { url, body, headers };
  }
  wanImage(model, prompt, images, parameters = {}) {
    const { size = '1K', ...reset } = parameters;
    return {
      model,
      input: {
        messages:
          [
            {
              role: "user",
              content: [
                { type: 'text', text: `修复旧照片，去除划痕，减少噪点，增强细节，高分辨率，逼真，自然的肤色，清晰的面部特征，面部磨皮，面部柔和，无失真，老照片修复；为所有人物添加自然肤色，根据服装材质和时代风格进行衣物着色，保持整体色调和谐，根据画面调整风格，${size}，保持原有比例，高清晰度，高画质，没有任何图像噪声，对人物进行磨皮。` },
                ...images.map(image => ({ type: 'image', image }))
              ]
            }
          ]
      },
      parameters: {
        prompt_extend: true,
        watermark: false,
        n: 1,
        // enable_interleave: true,
        // stream: true,           // 启用流式
        // incremental_output: true, // 某些模型需要
        enable_interleave: false,
        size,
        ...reset,
      }
    }
  }
  wan2_5_i2iPreview(model, prompt, images) {
    return {
      model,
      input: { images, prompt },
      parameters: {
        prompt_extend: true,
        n: 1
      }
    }
  }
}
