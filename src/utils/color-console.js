/**
 * @Author: colpu
 * @Date: 2025-11-13 00:16:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-13 00:40:48
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */

class ColorConsole {
  constructor(options = {}) {
    this.options = {
      showTimestamp: true,
      showIcons: true,
      colors: true,
      logLevel: 'debug', // 'error', 'warn', 'info', 'debug'
      ...options
    };

    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      log: console.log,
      debug: console.debug
    };

    this.setup();
  }

  setup() {
    if (this.options.colors) {
      this.overrideMethods();
    }
  }

  getTimestamp() {
    if (!this.options.showTimestamp) return '';
    return `[${new Date().toLocaleString()}]`;
  }

  colorize(text, colorCode) {
    if (!this.options.colors) return text;
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  formatMessage(level, ...args) {
    const levels = {
      error: { color: '31;1', icon: '🚨' },
      warn: { color: '33;1', icon: '⚠️' },
      info: { color: '36;1', icon: 'ℹ️' },
      success: { color: '32;1', icon: '✅' },
      debug: { color: '35;1', icon: '🐛' }
    };

    const config = levels[level];
    const timestamp = this.getTimestamp();
    const icon = this.options.showIcons ? config.icon : '';
    const prefix = this.colorize(`${icon} ${level.toUpperCase()}`, config.color);

    return [
      timestamp,
      prefix,
      ...args.map(arg => {
        if (typeof arg === 'string') {
          return this.colorize(arg, config.color);
        }
        return arg;
      })
    ].filter(Boolean);
  }

  overrideMethods() {
    // error - 始终显示
    console.error = (...args) => {
      this.originalConsole.error(...this.formatMessage('error', ...args));
    };

    // warn
    console.warn = (...args) => {
      if (['warn', 'info', 'debug'].includes(this.options.logLevel)) {
        this.originalConsole.warn(...this.formatMessage('warn', ...args));
      }
    };

    // info
    console.info = (...args) => {
      if (['info', 'debug'].includes(this.options.logLevel)) {
        this.originalConsole.info(...this.formatMessage('info', ...args));
      }
    };

    // success (自定义方法)
    console.success = (...args) => {
      this.originalConsole.log(...this.formatMessage('success', ...args));
    };

    // debug
    console.debug = (...args) => {
      if (this.options.logLevel === 'debug') {
        this.originalConsole.debug(...this.formatMessage('debug', ...args));
      }
    };
    console.errorWithDetails = this.errorWithDetails.bind(this);
  }
  // 自定义方法
  errorWithDetails(error, context = {}) {
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(60);
    const originalError = console.error;

    originalError(`\x1b[41m\x1b[37m\x1b[1m 🚨 ERROR DETAILS [${timestamp}] \x1b[0m`);
    originalError(`\x1b[31m${separator}\x1b[0m`);

    // 错误基本信息
    originalError(`\x1b[31m\x1b[1m📛 Name:\x1b[0m \x1b[31m${error.name || 'Unknown Error'}\x1b[0m`);
    originalError(`\x1b[31m\x1b[1m💬 Message:\x1b[0m \x1b[31m${error.message}\x1b[0m`);

    // Sequelize 特定信息
    if (error.original) {
      originalError(`\x1b[33m\x1b[1m🔍 Original:\x1b[0m \x1b[33m${error.original.message}\x1b[0m`);
    }

    if (error.sql) {
      originalError(`\x1b[36m\x1b[1m📊 SQL:\x1b[0m`);
      originalError(`\x1b[36m${error.sql}\x1b[0m`);
    }

    if (error.parameters) {
      originalError(`\x1b[35m\x1b[1m🔢 Parameters:\x1b[0m \x1b[35m${JSON.stringify(error.parameters)}\x1b[0m`);
    }

    // 验证错误
    if (error.errors && error.errors.length > 0) {
      originalError(`\x1b[33m\x1b[1m📋 Validation Errors:\x1b[0m`);
      error.errors.forEach((err, index) => {
        originalError(`\x1b[33m  ${index + 1}. ${err.path}: ${err.message} (value: ${err.value})\x1b[0m`);
      });
    }

    // 上下文
    if (Object.keys(context).length > 0) {
      originalError(`\x1b[34m\x1b[1m🌐 Context:\x1b[0m`);
      Object.keys(context).forEach(key => {
        originalError(`\x1b[34m  ${key}: ${context[key]}\x1b[0m`);
      });
    }

    // 堆栈
    if (error.stack && process.env.NODE_ENV === 'development') {
      originalError(`\x1b[90m\x1b[1m🔍 Stack:\x1b[0m`);
      originalError(`\x1b[90m${error.stack}\x1b[0m`);
    }

    originalError(`\x1b[31m${separator}\x1b[0m\n`);
  };

  // 恢复原始方法
  restore() {
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.log = this.originalConsole.log;
    console.debug = this.originalConsole.debug;
    delete console.success;
  }

  // 更新配置
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.restore();
    this.setup();
  }
}

// 创建默认实例并导出
const colorConsole = new ColorConsole();

export { ColorConsole, colorConsole };

