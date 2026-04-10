/**
 * @Author: colpu
 * @Date: 2026-03-28 21:49:21
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-10 11:24:33
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import Bailian from './bailian.js';
import AliViapi from './viapi.js';
import fetcher from './fetcher.js';
class TaskPoller {
  constructor() {
    this.pollTasks = Object.create(null); // 使用对象存储任务ID，避免重复和快速增删带来的Set迭代问题
    this.timer = undefined;
    this.interval;
    this.running = false;
  }

  /**
   *
   * @param {Object} option
   * @param {string} option.aikey - API Key
   * @param {string} option.updateTaskUrl - 更新任务状态的接口地址
   * @param {string} [option.uploadPath] - OSS 上的上传路径前缀，默认为 'upload/'
   * @param {Object} option.oss - 阿里云 OSS 配置项，包含 region、accessKeyId、accessKeySecret、bucket 等
   */
  init(option) {
    if (!option.updateTaskUrl) throw new Error('updateTaskUrl is required');
    this.updateTaskUrl = option.updateTaskUrl;
    this.interval = option.interval || 2000;
    this.bailian = new Bailian(option);
    this.viapi = new AliViapi(option.ossOption);
  }

  /**
   * 默认的查询阿里云任务的方法（需要根据实际 API 替换）
   * @param {object} tasks - 任务对象，包含 task_id 和 task_type
   * @param {string} tasks.task_id - 任务ID
   * @param {string} tasks.task_type - 任务类型
   * @returns {Promise<{task_status: string, output: any, message?: string}>}
   */
  async add(tasks) {
    tasks.forEach(({ task_type, task_id }) => {
      if (!this.pollTasks[task_type]) {
        this.pollTasks[task_type] = new Set();
      }
      this.pollTasks[task_type].add(task_id);
    });
    this.run();
  }

  /**
   * 启动轮询器（如果尚未运行）
   */
  async run() {
    if (this.running) return;
    console.log('TaskPoller: Starting polling...');
    this.running = true;
    await this.poll();
  }

  /**
   * 停止轮询器
   */
  stop() {
    // clearInterval(this.timer);
    this.running = false;
    console.log('TaskPoller: Polling stopped.');
  }
  pollSize() {
    let size = 0;
    for (const task_type in this.pollTasks) {
      size += this.pollTasks[task_type].size;
    }
    return size;
  }

  /**
   * 核心轮询逻辑
   */
  async poll() {
    const start = Date.now();
    console.log('TaskPoller: Polling...');
    const size = this.pollSize();
    console.log('TaskPoller: Polling tasks size:', size);
    if (size === 0) {
      console.log('TaskPoller: Polling completed.');
      return this.stop();
    }
    const prs = []
    for (const task_type in this.pollTasks) {
      for (const task_id of this.pollTasks[task_type]) {
        prs.push(this.getTaskResult(task_type, task_id).then(async (data) => {
          if (data.task_status === 'SUCCEEDED') {
            await this.updateTask(data);
          }
          return data;
        }))
      }
    }
    await Promise.all(prs);
    const end = Date.now();
    const duration = end - start;
    const interval = Math.max(this.interval - duration, 0);
    setTimeout(() => {
      this.poll();
    }, interval)
  }

  async getTaskResult(type, task_id) {
    switch (type) {
      case 'bailian':
        return this.bailian.getResult(task_id);
      case 'viapi':
        return this.viapi.getResult(task_id);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async updateTask(data) {
    const { task_status, task_id, task_type } = data;
    try {
      // 服务端更新状态
      await fetcher(this.updateTaskUrl, data, {
        method: 'PUT',
        headers: {
          'X-Verify-Skip': 'true',
        },
      }).then(res => {
        console.log(`Task ${task_id} updated successfully:`, res);
      }).catch(err => {
        console.log(`Task ${task_id} updated error:`, err);
      });
      // 状态处理
      switch (task_status) {
        // 任务完成，失败将从任务池中删除掉对应任务
        case 'SUCCEEDED':
        case 'FAILED':
          this.pollTasks[task_type].delete(task_id);
          break;
        // 运行中，等待下一次轮询
        case 'PENDING':
        case 'RUNNING':
          break;
        default:
          console.error(`Unknown task status: ${task_status}`);
      }
    } catch (error) {
      // 如果是网络错误或服务端错误，可以尝试重试
      console.error(`Failed to update task ${task_id}:`, error);
    }
  }
}

// 导出单例实例（假设使用环境变量配置）
export default new TaskPoller();
