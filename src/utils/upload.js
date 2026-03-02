/**
 * @Author: colpu
 * @Date: 2025-12-18 23:22:47
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-28 22:42:59
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

/**
 * 文件上传工具模块
 * - uploadMulter: 基于 @koa/multer 的上传中间件，支持图片过滤、大小限制
 * - getFileMD5: 计算文件 MD5，用于去重/秒传
 * - koaBusboy: 基于 busboy 的流式上传，支持 SSE 进度
 */
import fs from 'fs';
import path from 'path';
import multer from '@koa/multer';
import busboy from 'busboy';
import crypto from 'crypto';
import fse from 'fs-extra';
function storage(dir = './') {
  // 1、确保临时目录存在
  fse.ensureDirSync(dir);
  // 2、配置 multer
  return multer.diskStorage({
    destination: (ctx, file, cb) => {
      cb(null, dir);
    },
    filename: (ctx, file, cb) => {
      cb(null, crypto.randomUUID() + path.extname(file.originalname));
    }
  });
}
function fileFilter(ctx, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片！'), false);
  }
};

/**
 * 创建 multer 上传中间件
 * @param {String} dir 临时存储目录
 * @param {Number} [fileSize=5MB] 单文件大小限制（字节）
 * @returns {Function} Koa multer 中间件
 */
export default function uploadMulter(dir, fileSize = 5 * 1024 * 1024) {
  return multer({
    storage: storage(dir),
    fileFilter,
    limits: { fileSize }
  });
}

/**
 * 计算单个文件的 MD5 哈希
 * @param {Object} file multer 文件对象 { path }
 * @returns {Promise<String>} MD5 十六进制字符串
 */
export function getFileMD5(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(file.path);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
      const md5 = hash.digest('hex');
      const ext = path.extname(file.originalname).toLowerCase() || '.bin';
      resolve(md5 + ext);
    });
    stream.on('error', reject);
  });
}

// SSE上传方式，支持进度反馈
export function koaBusboy(options) {
  // 存储SSE上传进度
  const progressMap = new Map();
  // 发送SSE消息
  const sendSSEMessage = (res, data) => {
    // 标准SSE格式: 请注意最后一行为\n
    // event: eventType
    // data: JSON.stringify(eventData)
    // \n
    const sseMessage = [
      `event: ${data.event}`,
      `data: ${JSON.stringify(data)}`,
      '\n'
    ].join('\n');
    res.write(sseMessage);
  };
  const ismd5name = options.ismd5name || false;

  const getFinalPath = (dir, fields, ismd5name) => {
    // 根据md5生成文件名，判断是否使用md5作为文件名
    if (fields.md5 && ismd5name) {
      fields.filename = fields.md5;
    } else {
      fields.filename = filename;
    }
    return path.join(dir, fields.filename);
  }

  const setProgressCompleted = (upload_id, total, message = '上传完成') => {
    // 文件已存在，直接设置进度为完成
    progressMap.set(upload_id, {
      loaded: total,
      total,
      percent: 100,
      timestamp: Date.now(),
      message,
      event: 'completed',
      upload_id
    });
    // 10秒后自动清理
    setTimeout(() => progressMap.delete(upload_id), 10000);
  }

  const clearProgressMap = (upload_id) => {
    setTimeout(() => { progressMap.delete(upload_id) }, 1000);
  }

  return async (ctx, next) => {
    if (ctx.method === 'GET') {
      // 是否已经发送过数据
      let hasSent = false;
      // SSE响应时间
      const startTime = Date.now();
      // SSE最大等待时间3秒
      const maxWaitTime = 3000;
      // SSE推送时间
      const sendTime = 200;

      // 关闭Koa的自动响应处理
      ctx.respond = false;
      const res = ctx.res;

      ctx.status = 200;
      // 设置SSE标准响应头-必须是text/event-stream
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // 处理GET请求，返回上传进度
      const upload_id = ctx.query.upload_id;
      const checkAndSendProgress = () => {
        // 检查上传进度
        const progress = progressMap.get(upload_id);
        if (progress) {
          // 第一次有数据，开始正常推送
          hasSent = true;
          sendSSEMessage(res, progress);
          if (progress.event === 'completed') {
            res.end();
          } else {
            setTimeout(checkAndSendProgress, sendTime);
          }
        } else {
          const timestamp = Date.now();
          if (timestamp - startTime > maxWaitTime) {
            if (!hasSent) {
              sendSSEMessage(res, {
                message: '上传ID无效或上传已结束',
                event: 'error',
                timestamp,
                upload_id
              });
            } else {
              sendSSEMessage(res, {
                message: '上传已结束',
                event: 'end',
                timestamp: Date.now(),
                upload_id
              });
            }
            res.end();
          } else {
            setTimeout(checkAndSendProgress, sendTime);
          }
        }
      }
      checkAndSendProgress();
      // 客户端断开时结束
      ctx.req.on('close', () => {
        res.end();
      });
    } else if (ctx.method === 'POST') {
      const upload_id = ctx.headers['x-upload-id'] || Date.now().toString();
      // 存储上传进度
      const total = parseInt(ctx.headers['content-length'] || '0');
      const upload = ctx.app.config.upload || {};
      const TEMP_DIR = upload.temp;
      const UPLOAD_DIR = upload.fullDir;

      // 关闭Koa的自动响应处理
      ctx.respond = false;
      const res = ctx.res;

      // 设置初始化消息
      progressMap.set(upload_id, {
        loaded: 0,
        total,
        percent: 0,
        timestamp: Date.now(),
        message: `已开始上传`,
        event: 'init',
        upload_id,
      });

      const bb = busboy({ headers: ctx.headers });
      const fields = Object.create(null); // 存储普通字段(如md5)
      let loaded = 0; // 已上传字节数
      let isSkip = false; // 是否跳过后续处理

      // 存储上传文件信息字段
      bb.on('field', (fieldname, val) => {
        fields[fieldname] = val;
      });

      bb.on('file', (fieldname, stream, info) => {
        const { filename, encoding, mimeType } = info;
        const ext = path.extname(filename); // 获取文件扩展名
        // 设置fileds字段
        Object.assign(fields, {
          fieldname,
          ext,
          encoding, mimeType,
        });

        // 生成最终文件路径
        const finalPath = getFinalPath(UPLOAD_DIR, fields, ismd5name);
        // 如果文件已存在，删除临时文件，否则移动文件到最终目录
        const existing = fs.existsSync(finalPath);
        if (existing) {
          setProgressCompleted(upload_id, total, '文件已存在，上传跳过');
          // 直接结束流，避免后续处理
          stream.resume();
          isSkip = true;
          return;
        }

        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const temp_path = path.join(TEMP_DIR, `${path.parse(filename).name}-${uniqueSuffix}${ext}`);
        const writeStream = fs.createWriteStream(temp_path);
        stream.pipe(writeStream);

        // 追踪单个文件上传进度
        stream.on('data', (chunk) => {
          const chunkLength = chunk.length;
          loaded += chunkLength;
          if (total > 0) {
            const percent = Math.round((loaded / total) * 100);
            progressMap.set(upload_id, {
              loaded,
              total,
              percent,
              timestamp: Date.now(),
              message: `当前已上传: ${percent}%`,
              event: 'progress',
              upload_id
            });
          }
        });

        stream.on('end', () => {
          const finalPath = getFinalPath(UPLOAD_DIR, fields, ismd5name); // 获取最终文件路径
          // 如果文件已存在，删除临时文件，否则移动文件到最终目录
          if (fs.existsSync(finalPath)) {
            fs.unlinkSync(temp_path);
          } else {
            fs.renameSync(temp_path, finalPath);
          }
          setProgressCompleted(upload_id, total);
        });

      });

      bb.on('close', async () => {
        // ✅ 手动发送 JSON 响应
        const body = JSON.stringify({
          status: 0,
          data: {
            ...fields,
            src: path.join(options.dir || './', fields.filename),
            upload_id,
            message: isSkip ? '文件已存在，跳过上传' : '上传完成',
          },
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', Buffer.byteLength(body));
        res.end(body);
        clearProgressMap(upload_id);
      });

      bb.on('error', (err) => {
        const body = JSON.stringify({
          message: err.message || '上传失败',
          upload_id,
          filename
        });
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', Buffer.byteLength(body));
        res.end(body);
        clearProgressMap(upload_id);
      });

      // 计算总请求体大小（近似），如需进度可在这里上报到 SSE / WebSocket
      let totalBytes = 0;
      ctx.req.on('data', (chunk) => {
        totalBytes += chunk.length;
        // 留空：生产环境不直接打印大体积日志
      });

      ctx.req.on('error', (err) => {
        if (!res.writableEnded) {
          res.statusCode = 400;
          res.end('Bad request');
        }
        clearProgressMap(upload_id);
      });
      ctx.req.pipe(bb);
    } else {
      await next();
    }
  }
};
