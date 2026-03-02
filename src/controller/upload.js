/**
 * @Author: colpu
 * @Date: 2025-12-18 22:05:40
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-31 16:37:15
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import fs from 'fs/promises';
import * as fsSync from 'fs';
import path, { join } from 'path';
import { Controller } from "@colpu/core";
import { getFileMD5 } from "../utils/upload.js";
import Joi from "joi";
// 用于存储上传进度
const uploadProgress = new Map();

/**
 * 文件上传控制器
 */
export default class UploadController extends Controller {
  /**
   * @api {post} /upload/single
   * @apiName uploadSingle
   * @apiDescription 单文件上传，支持 MD5 去重
   * @apiGroup Upload
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {File} file 上传文件 (必需)
   * @apiBody {String} [md5] 文件 MD5，用于秒传/去重
   * @apiSuccess {Object} data 包含 filename、originalname、url、domain、size
   */
  async single(ctx) {
    if (!ctx.file) {
      ctx.throw(400, '未选择文件');
    }
    // 获取上传配置目录
    const domain = this.config.domain;
    const config = this.config.upload || {};
    const uploadDir = config.fullDir;
    const file = ctx.file
    // 1. 读取临时文件内容
    const buffer = await fs.readFile(file.path);

    // 2. 计算 MD5
    const body = ctx.request.body || {};
    let md5File;
    if (body.md5) {
      md5File = body.md5;
    } else {
      md5File = await getFileMD5(file);
    }
    const finalFilePath = join(uploadDir, md5File);
    // 3. 检查是否已存在（去重）
    let exists = false;
    try {
      await fs.access(finalFilePath);
      exists = true;
    } catch (e) {
      // 文件不存在
    }
    // 4. 如果不存在，则移动（或写入）到正式目录
    if (!exists) {
      // 方式 A：直接 rename（最快，但要求同磁盘）
      // await fs.rename(file.path, finalFilePath);

      // 方式 B：安全写入（跨磁盘也支持）
      await fs.writeFile(finalFilePath, buffer);
    }
    // 5. 清理临时文件（无论是否重复都要删）
    await fs.unlink(file.path);
    let originalname = file.originalname;
    if (/%[0-9A-Fa-f]{2}/.test(originalname)) {
      originalname = decodeURIComponent(originalname);
    }
    ctx.respond({
      filename: md5File,
      originalname,
      url: `${domain}/uploads/${md5File}`,
      domain,
      size: file.size
    }, 0, '上传成功')
  }

  /**
   * @api {post} /upload/multiple
   * @apiName uploadMultiple
   * @apiDescription 多文件上传（最多 5 个）
   * @apiGroup Upload
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiBody {File[]} files 上传文件数组 (必需)
   * @apiSuccess {Array} data 文件信息数组
   */
  async multiple(ctx, next) {
    if (!ctx.files || ctx.files.length === 0) {
      ctx.throw(400, '未选择文件');
    }
    // 为每个文件计算 MD5
    const filesWithMD5 = [];
    const domain = this.config.domain;
    for (const file of ctx.files) {
      const md5File = await getFileMD5(file);
      filesWithMD5.push({
        filename: md5File,
        originalname: file.originalname,
        url: `${domain}/uploads/${md5File}`,
        size: file.size
      });
    }
    ctx.respond(filesWithMD5, 0, '上传成功')
  }

  /**
   * @api {get} /upload/list
   * @apiName uploadList
   * @apiDescription 获取已上传文件列表
   * @apiGroup Upload
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiSuccess {Array} data 文件列表（filename、path、size、created_at、updated_at）
   */
  async list(ctx) {
    const files = [];
    // 获取上传配置目录
    const config = this.config.upload || {};
    const uploadDir = config.dir;
    if (uploadDir && fsSync.existsSync(uploadDir)) {
      const fileNames = fsSync.readdirSync(uploadDir);
      files.push(
        ...fileNames.map((filename) => {
          const filePath = path.join(uploadDir, filename);
          const stats = fsSync.statSync(filePath);
          return {
            filename,
            path: filePath,
            size: stats.size,
            created_at: stats.birthtime,
            updated_at: stats.mtime,
          };
        })
      );
    }
    ctx.respond(files);
  }

  /**
   * @api {delete} /upload
   * @apiName uploadDelete
   * @apiDescription 删除已上传文件
   * @apiGroup Upload
   * @apiVersion 1.0.0
   * @apiHeader {String} Authorization Bearer Token (必需)
   * @apiQuery {String} filename 文件名 (必需)
   * @apiSuccess {Object} data 删除结果
   */
  async delete(ctx) {
    const { filename } = ctx.validateAsync({
      query: {
        filename: Joi.string().required(),
      },
    });
    // 获取上传配置目录
    const config = this.config.upload || {};
    const uploadDir = config.dir;
    const filePath = join(uploadDir, filename);
    try {
      await fs.unlink(filePath);
      ctx.respond(null, 0, '文件删除成功');
    } catch (e) {
      ctx.throw(404, '文件删除失败或文件不存在');
    }

  }
}




