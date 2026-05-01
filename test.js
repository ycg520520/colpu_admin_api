import WebSocket from 'ws';
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

class ComfyUIGenerator {
  constructor(baseUrl, workflowPath, outputDir = "./output") {
    this.baseUrl = baseUrl;
    this.workflowPath = workflowPath;
    this.outputDir = outputDir;
    // 确保输出目录存在
    if (!mkdirSync(this.outputDir, { recursive: true })) {
      console.log(`输出目录 ${this.outputDir} 已就绪`);
    }
  }

  // 1. 核心：提交工作流到 ComfyUI
  async submitWorkflow(workflow, clientId = randomUUID()) {
    const response = await fetch(`${this.baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: workflow,
        client_id: clientId // 核心：必须带上 client_id
      }),
    });
    if (!response.ok) throw new Error(`提交失败: HTTP ${response.status}`);
    const result = await response.json();
    if (result.error) throw new Error(`工作流错误: ${result.error}`);
    return result.prompt_id;
  }

  // 2. 核心：轮询等待任务完成并下载图片
  async waitForResult(promptId) {
    const historyUrl = `${this.baseUrl}/history/${promptId}`;
    let attempts = 0;
    const maxAttempts = 300; // 最多等待 150 秒

    while (attempts < maxAttempts) {
      const response = await fetch(historyUrl);
      const data = await response.json();

      if (data && data[promptId] && data[promptId].outputs) {
        const outputs = data[promptId].outputs;
        const imageBuffers = [];

        for (const nodeId in outputs) {
          const nodeOutput = outputs[nodeId];
          if (nodeOutput.images && nodeOutput.images.length > 0) {
            for (const imageInfo of nodeOutput.images) {
              const viewUrl = `${this.baseUrl}/view?` + new URLSearchParams({
                filename: imageInfo.filename,
                type: imageInfo.type || 'output',
                subfolder: imageInfo.subfolder || ''
              });
              const imgResponse = await fetch(viewUrl);
              const imageBuffer = await imgResponse.arrayBuffer();
              imageBuffers.push(Buffer.from(imageBuffer));
            }
          }
        }
        return imageBuffers;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    throw new Error(`任务 ${promptId} 超时`);
  }

  async composeWorkflow(params, baseWorkflow) {
    // 读取基础工作流 JSON
    const workflow = await this.getWorkflow(this.workflowPath);
    // 动态替换提示词 (根据你的节点 ID 修改)
    if (params.prompt) {
      workflow["104:90"]["inputs"]["text"] = params.prompt;
    }
    // 动态替换随机种子
    if (params.seed !== undefined) {
      workflow["104:92"]["inputs"]["seed"] = params.seed;
    } else {
      // 如果没传 seed，默认使用随机数
      workflow["104:92"]["inputs"]["seed"] = Math.floor(Math.random() * 1000000000);
    }
    return workflow;
  }

  // 3. 通用生成接口：动态修改参数并执行
  async generate(params = {}) {
    const workflow = await this.composeWorkflow(params, this.workflowPath);
    console.log("正在提交任务...");
    const promptId = await this.submitWorkflow(workflow);
    const buffers = await this.waitForResult(promptId);

    // 保存图片到本地
    const savedPaths = [];
    buffers.forEach((buffer, index) => {
      const filename = `${promptId}${index === 0 ? '' : `_${index}`}.png`;
      this.saveImage(buffer, filename);
      savedPaths.push(filePath);
    });

    return savedPaths;
  }
  async saveImage(buffer, filename) {
    const filePath = path.join(this.outputDir, filename);
    writeFileSync(filePath, buffer);
    console.log(`图片已保存: ${filePath}`);
    return filePath;
  }

  async getWorkflow(workflowPath) {
    return JSON.parse(readFileSync(workflowPath || this.workflowPath, "utf-8"))
  }
}

class ComfyUIListener {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace('http', 'ws'); // 将 http:// 替换为 ws://
    this.clientId = randomUUID();
    this.ws = null;
    this.resolveQueue = {}; // 用于存放不同 promptId 的回调函数
  }

  // 建立 WebSocket 连接
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const wsUrl = `${this.baseUrl}/ws?clientId=${this.clientId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log(`✅ WebSocket 已连接，Client ID: ${this.clientId}`);
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(message);
    });

    this.ws.on('close', () => {
      console.log('⚠️ WebSocket 连接已断开，3秒后尝试重连...');
      setTimeout(() => this.connect(), 3000);
    });

    this.ws.on('error', (err) => {
      console.error('❌ WebSocket 发生错误:', err);
    });
  }

  // 处理服务器推送的各类消息
  handleMessage(message) {
    const { type, data } = message;
    switch (type) {
      case 'status': // 队列状态更新
        console.log(`📊 队列状态: 待处理 ${data.status.exec_info.queue_remaining} 个任务`);
        break;

      case 'executing': // 某个节点开始执行
        if (data.node) {
          console.log(`⚙️ 正在执行节点: ${data.node}`);
        } else if (data.prompt_id && this.resolveQueue[data.prompt_id]) {
          // 当 data.node 为 null 时，代表整个工作流执行完毕
          console.log(`🎉 任务 ${data.prompt_id} 执行完毕！`);
          this.resolveQueue[data.prompt_id]('success');
          delete this.resolveQueue[data.prompt_id];
        }
        break;

      case 'progress': // 具体的进度百分比（如 KSampler 采样进度）
        console.log(`🔄 进度: ${data.value} / ${data.max} (${Math.round((data.value / data.max) * 100)}%)`);
        break;

      case 'executed': // 单个节点执行完成（通常包含输出的图片信息）
        console.log(`✅ 节点 ${data.node} 执行完成`);
        // 如果需要实时获取单节点生成的图片，可以在这里处理 data.output.images
        break;

      // 如果需要接收实时预览图（二进制数据），需单独监听 ws.on('message') 判断 Buffer
    }
  }

  // 监听指定任务直到完成
  waitForTask(promptId) {
    return new Promise((resolve) => {
      this.resolveQueue[promptId] = resolve;
    });
  }
}


// ================= 使用示例 =================
const BASE_URL = 'http://192.168.1.15:8000'
// // 初始化生成器轮询模式
// const generator = new ComfyUIGenerator(
//   BASE_URL,
//   './follow/get_started_text_to_image_api.json'
// );

// try {
//   // 第一次调用：自定义提示词
//   await generator.generate({
//     prompt: "A cute cat sitting on a windowsill, anime style"
//   });

//   // 第二次调用：自定义提示词和固定种子
//   await generator.generate({
//     prompt: "A futuristic city with flying cars, cyberpunk",
//     seed: 123456
//   });
// } catch (err) {
//   console.error("生成失败:", err);
// }

// 初始化生成器websocket模式
const generator = new ComfyUIGenerator(
  BASE_URL,
  './follow/get_started_text_to_image_api.json'
);
const listener = new ComfyUIListener(BASE_URL);

// 1. 先建立 WebSocket 长连接
listener.connect();

try {
  console.log("开始生图任务...");
  // 2. 提交工作流，拿到 promptId
  // 读取基础工作流 JSON
  const workflow = await generator.composeWorkflow({ prompt: "A cute cat sitting on a windowsill, anime style" });
  const promptId = await generator.submitWorkflow(workflow, listener.clientId);
  // 3. 挂起等待，WebSocket 会在后台实时打印进度，并在完成后 resolve
  await listener.waitForTask(promptId);
  // 4. 任务完成后，再调用原来的逻辑去 /history 接口拉取最终的高清图片并保存
  const buffers = await generator.waitForResult(promptId);
  // 保存图片到本地
  const savedPaths = [];
  buffers.forEach((buffer, index) => {
    const filename = `${promptId}${index === 0 ? '' : `_${index}`}.png`;
    const filePath = path.join(generator.outputDir, filename);
    generator.saveImage(buffer, filename);
    savedPaths.push(filePath);
  });

} catch (err) {
  console.error("生成失败:", err);
}
