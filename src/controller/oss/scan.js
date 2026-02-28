/**
 * @Author: colpu
 * @Date: 2025-06-07 10:39:52
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-31 23:48:58
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Joi from "joi";
import ImageauditClient, { ScanTextRequest, ScanTextRequestTasks, ScanTextRequestLabels, ScanImageAdvanceRequestTask, ScanImageAdvanceRequest } from "@alicloud/imageaudit20191230";
import { Config } from "@alicloud/openapi-client";
import { RuntimeOptions } from "@alicloud/tea-util";
import http from "http";
import https from "https";
import { Controller } from "@colpu/core";

const SCANTEXT_LABELS = {
  spam: "垃圾",
  politics: "敏感",
  abuse: "辱骂",
  terrorism: "暴恐",
  porn: "鉴黄",
  flood: "灌水",
  contraband: "违禁",
  ad: "广告",
};
const SCANIMAGE_LABELS = {
  porn: "鉴黄",
  terrorism: "敏感",
  ad: "广告",
  live: "不良场景",
  logo: "Logo",
};

// 内容审查
export default class AliScan extends Controller {
  constructor(ctx) {
    super(ctx);
    // 获取配置
    const { ali } = this.config;
    const accessConfig = ali.scan;
    if (!accessConfig) {
      return ctx.respond(null, 1, "服务端未找到配置");
    }
    const config = new Config({
      accessKeyId: accessConfig.accessKeyId,
      accessKeySecret: accessConfig.accessKeySecret,
    });
    config.endpoint = accessConfig.endpoint;
    this.client = new ImageauditClient(config);
  }
  async text(ctx) {
    // 参数验证
    ctx.validateAsync({
      body: {
        content: Joi.string().required(),
      },
      status: 10001,
    });
    console.log(ctx.request.body);
    const scanTextRequest = new ScanTextRequest({
      tasks: [
        new ScanTextRequestTasks({
          content: ctx.request.body.content,
        }),
      ],
      labels: Object.keys(SCANTEXT_LABELS).map(
        (label) =>
          new ScanTextRequestLabels({
            label,
          })
      ),
    });
    const runtime = new RuntimeOptions({});
    let resp;
    try {
      resp = await this.client.scanTextWithOptions(scanTextRequest, runtime);
    } catch (err) {
      console.error(err);
      ctx.throw(err);
    }
    const results = resp.body.data.elements[0].results[0];
    if (Object.keys(SCANTEXT_LABELS).includes(results.label)) {
      const breach = results.details
        .map((item) => SCANTEXT_LABELS[item.label])
        .join(",");
      ctx.respond(`识别出：${breach}文本内容!!!`, -1, "存在文本内容违规");
    } else {
      ctx.respond(null, null, "文本内容安全");
    }
  }

  getResponse(httpClient, url) {
    return new Promise((resolve, reject) => {
      httpClient.get(url, (response) => {
        resolve(response);
      });
    });
  }

  async image(ctx) {
    ctx.validateAsync({
      body: {
        url: Joi.string().required(),
      },
      status: 10001,
    });
    console.log(ctx.request.body.url);

    // 场景一，使用本地文件
    // const task0 = new ImageauditClient.ScanImageAdvanceRequestTask();
    // const fileStream = fs.createReadStream('/tmp/ScanImage1.png');
    // task0.imageURLObject = fileStream;

    // 场景二，使用任意可访问的url
    const url = new URL(ctx.request.body.url);
    const httpClient = url.protocol == "https:" ? https : http;
    const task1 = new ScanImageAdvanceRequestTask();
    task1.imageURLObject = await this.getResponse(httpClient, url);

    const scanTextRequest = new ScanImageAdvanceRequest({
      task: [
        // task0,
        task1,
      ],
      scene: Object.keys(SCANIMAGE_LABELS),
    });

    // // 场景三，使用文件在上海地域OSS
    // const scanTextRequest = new ImageauditClient.ScanImageRequest({
    //   task: [
    //     new ImageauditClient.ScanImageRequestTask({
    //       imageURL: ctx.query.url,
    //     }),
    //   ],
    //   scene: Object.keys(SCANIMAGE_LABELS),
    // });

    const runtime = new RuntimeOptions({});
    let resp;
    try {
      resp = await this.client.scanImageAdvance(scanTextRequest, runtime);
      // // 场景三，使用文件在上海地域OSS
      // resp = await this.client.scanImageWithOptions(scanTextRequest, runtime);
    } catch (err) {
      console.error(err);
      ctx.throw(err);
    }
    ctx.respond(resp.body.data.results);
    // const res = [
    //   {
    //     imageURL:
    //       "https://oimageb6.ydstatic.com/image?id=-1947783248096502441&product=adpublish&format=JPEG&w=300&h=250&sc=0&rm=0",
    //     subResults: [
    //       { label: "normal", rate: 99.9, scene: "porn", suggestion: "pass" },
    //       {
    //         label: "normal",
    //         rate: 99.88,
    //         scene: "terrorism",
    //         suggestion: "pass",
    //       },
    //       { label: "normal", rate: 99.91, scene: "ad", suggestion: "pass" },
    //       { label: "normal", rate: 99.91, scene: "live", suggestion: "pass" },
    //       { label: "normal", rate: 99.9, scene: "logo", suggestion: "pass" },
    //     ],
    //   },
    // ];
    // const subResults = res[0].subResults.filter(
    //   (item) => item.label !== "normal"
    // );
    const subResults = resp.body.data.results[0].subResults.filter(
      (item) => item.label !== "normal"
    );
    if (subResults.length) {
      const breach = subResults
        .map((item) => SCANTEXT_LABELS[item.label])
        .join(",");
      ctx.respond(`识别出：${breach}图片内容!!!`, -1, "存在图片内容违规");
    } else {
      ctx.respond(null, null, "图片内容安全");
    }
  }
};
