import { readdirSync, statSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { parse, stringify } from 'comment-parser';
const __dirname = import.meta.dirname;

/**
 * 接口文档生成器
 * 提取 JSDoc 注释并转换为 Markdown 格式
 */
class DocGenerator {
  constructor(srcDir, outputDir) {
    this.srcDir = srcDir;
    this.outputDir = outputDir;
  }

  /**
   * 扫描所有 JS/TS 文件
   * @returns {string[]} 文件路径列表
   */
  scanFiles() {
    const files = [];
    const walk = (dir) => {
      const items = readdirSync(dir);
      items.forEach(item => {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (/\.(js|ts)$/.test(item)) {
          files.push(fullPath);
        }
      });
    };
    walk(this.srcDir);
    return files;
  }

  /**
   * 提取文件中的 JSDoc 注释
   * @param {string} filePath - 文件路径
   * @returns {Array} 注释对象数组
   */
  extractComments(filepath) {
    const content = readFileSync(filepath, 'utf-8');
    const comments = parse(content);
    return comments.map(comment => ({
      ...comment,
      api: this.generateAPIComment(comment)
    }));
  }

  composeGrouped(comments) {
    // 按文件分组
    const res = comments.reduce((acc, item) => {
      let file = relative(this.srcDir, item.file).replace(/\.(t|j)s$/, '');
      if (!file.includes('/')) {
        file = `sys/${file}`;
      }
      acc[file] = item;
      return acc;
    }, {});
    return res;
  }

  getHash(file) {
    return file.replace(/[\/\\]/g, '-');
  }
  cleanedSource(source, split = '\n') {
    // 从原始行中提取完整格式的示例
    const lines = source
      .map(line => line.source)  // 获取每一行的原始字符串
      .slice(1)  // 跳过标签行 "@apiSuccessExample {json} Success-Response:"
      .map(line => {
        // 移除行首的 " *"
        return line.replace(/^\s*\*(\s|\/)?/, '');
      })
      .join(split);
    return lines.trim();
  }
  generateAPIComment(comment) {
    // 提取基础信息
    const api = {
      method: '',
      path: '',
      name: '',
      nameCN: '',
      description: '',
      group: '',
      version: '',
      bodyParams: [],
      successParams: [],
      successExample: ''
    };
    comment.tags.forEach(item => {
      switch (item.tag) {
        case 'api':
          api.method = item.type.toUpperCase();
          api.path = item.name;
          break;
        case 'apiName':
          api.name = item.name;
          api.nickname = item.description;
          break;
        case 'apiDescription':
          api.description = item.name;
          break;
        case 'apiGroup':
          api.group = item.name;
          break;
        case 'apiVersion':
          api.version = item.name;
          break;
        case 'apiBody':
          api.bodyParams.push({
            name: item.name,
            type: item.type,
            optional: item.optional,
            description: item.description
          });
          break;
        case 'apiExample':
          api.example = this.cleanedSource(item.source);
          break;
        case 'apiSuccessExample':
          api.successExample = this.cleanedSource(item.source);
          break;
        case 'apiErrorExample':
          api.errorExample = this.cleanedSource(item.source);
          break;
      }
    });
    // 只有至少包含 method 和 path 才视为有效 API
    if (api.method && api.path) {
      return api;
    }
  }
  generateGroupTree(groups) {
    const obj = {};
    Object.keys(groups).forEach((path) => {
      const paths = path.split('/');
      const item = groups[path];
      let current = obj;
      paths.forEach((name, idx) => {
        if (idx === paths.length - 1) {
          current[path] = item;
        } else {
          if (!current[name]) {
            current[name] = {};
          }
          current = current[name];
        }
      });
    });
    return obj;
  }
  generateTree(groupTree, index = '') {
    let md = '';
    Object.keys(groupTree).forEach((path, idx) => {
      const order = idx + 1;
      md += `${index ? `\t` : ''}${order}. [${path}](${path}#${this.getHash(path)})\n`;
      // const order = '-';
      // md += `${index ? `\t` : ''}${order} [${path}](${path}#${this.getHash(path)})\n`;
      const childGroupTree = groupTree[path];
      if (!childGroupTree.file) {
        md += this.generateTree(childGroupTree, order);
      }
    });
    return md;
  }

  /**
   * 写入文件，自动创建不存在的目录
   * @param {string} filePath - 文件路径
   * @param {string} content - 文件内容
   * @param {string} encoding - 编码格式
   */
  writeFileSync(filePath, content, encoding = 'utf-8') {
    const dir = join(filePath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, content, encoding);
  }

  generateDirMarkdown(groups) {
    const groupTree = this.generateGroupTree(groups);
    let md = '# 接口文档\n\n';
    md += `生成时间：${new Date().toLocaleString('zh-CN')}\n`;
    // 生成目录
    md += '### 目录\n\n';
    md += this.generateTree(groupTree);
    md += '---\n\n';
    const outputPath = join(this.outputDir, 'index.md');
    this.writeFileSync(outputPath, md, 'utf-8');
  }

  generateAPIMarkdown(api) {
    let md = '';
    const apiAnchor = `${api.method}-${api.path}`.replace(/\//g, '-').replace(/-{1,}/g, '-').toLowerCase();
    md += `## ${api.name} ${api.nameCN} {#${apiAnchor}}\n\n`;
    md += `**版本**: ${api.version || '无'}\n\n`;
    md += `**请求**: \`${api.method}\` \`${api.path}\` \n\n`;
    md += `**接口描述**: ${api.description || '无'}\n`;

    // 请求参数
    if (api.bodyParams.length > 0) {
      md += `#### 请求参数 (Body)\n\n`;
      md += `| 参数名 | 类型 | 必选 | 描述 |\n`;
      md += `| ---- | ---- | ---- | ---- |\n`;
      api.bodyParams.forEach(p => {
        md += `| ${p.name} | ${p.type} | ${p.optional ? '否' : '是'} | ${p.description} |\n`;
      });
      md += '\n';
    }

    // 响应参数
    if (api.successParams.length > 0) {
      md += `#### 响应参数\n\n`;
      md += `| 参数名 | 类型 | 描述 |\n`;
      md += `| ---- | ---- | ---- |\n`;
      api.successParams.forEach(p => {
        md += `| ${p.name} | ${p.type} | ${p.description} |\n`;
      });
      md += '\n';
    }

    // 示例
    if (api.example) {
      md += `##### 示例\n\n`;
      api.example.split('\n').forEach(line => {
        if (/Location\:/.test(line)) {
          const herf = line.replace('Location:', '').trim();
          md += `[${herf}](${herf})\n\n`;
        } else {
          md += `${line}\n\n`;
        }
      });
    }
    // 响应成功示例
    if (api.successExample) {
      md += `#### 响应示例\n\n`;
      md += '```json\n';
      md += api.successExample;
      md += '\n```\n\n';
    }
    // 响应失败示例
    if (api.errorExample) {
      md += `#### 响应示例\n\n`;
      md += '```json\n';
      md += api.errorExample;
      md += '\n```\n\n';
    }
    return md;
  }

  /**
   * 生成 Markdown 文档
   * @returns {string} Markdown 内容
   */
  generateMarkdown(groups) {
    Object.keys(groups).forEach((file, index) => {
      let md = '# 接口文档\n\n';
      md += `> 自动生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
      const comments = groups[file].comments;
      const copyright = comments[0];
      if (!copyright.api) {
        md += '```text\n';
        md += this.cleanedSource(copyright.source);
        md += '\n```\n\n';
      }
      const apis = comments.filter(item => item.api);
      apis.forEach(({ api }) => {
        md += this.generateAPIMarkdown(api);
      });
      const outputPath = join(this.outputDir, `${file}.md`);
      this.writeFileSync(outputPath, md, 'utf-8');
    });
  }

  /**
   * 执行文档生成
   */
  generate() {
    console.log('开始扫描文件...');
    const files = this.scanFiles();
    console.log(`找到 ${files.length} 个文件`);
    const allComments = [];
    let total = 0;
    files.forEach(file => {
      const comments = this.extractComments(file);
      if (comments.length > 0) {
        const len = comments.filter(item => item.api).length;
        total += len;
        console.log(`${file}: ${len} 个接口`);
        allComments.push({
          file,
          comments
        });
      }
    });
    console.log(`共提取 ${total} 个接口`);

    // 确保输出目录存在
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
    // 进行分组
    const groups = this.composeGrouped(allComments);
    // 生成并写入 Markdown
    this.generateDirMarkdown(groups);
    this.generateMarkdown(groups);

    console.log(`文档已生成：${this.outputDir}`);
  }
}

// 执行
const srcDir = join(__dirname, '../src/controller');
const outputDir = join(__dirname, '../docs/api');
console.log(srcDir, outputDir)
const generator = new DocGenerator(srcDir, outputDir);
generator.generate();
