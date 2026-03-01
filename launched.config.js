/**
 * @Author: colpu
 * @Date: 2025-03-31 17:37:38
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-01 18:29:37
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { getConfig } from "@colpu/cli";
const env = process.env.NODE_ENV;
const {
  name,
  config = {},
  pkg = {}
} = await getConfig(import.meta.dirname, { env });
console.log("当前环境:launched.config.js", env, import.meta.dirname);
const WORKSPACE = `/data/tmp/${name}`;
const PRODUCTION_DIR = `/data/project/${name}`;
const command = [
  "git fetch",
  "yarn install --no-lockfile --production=false",
  "npm run build",
  `cp -rf ${WORKSPACE}/current/. ${PRODUCTION_DIR}`,
  `cd ${PRODUCTION_DIR}`,
  "yarn install --no-lockfile --production",
  `pm2 startOrRestart launched.config.json --env ${env}`,
];
function curlBash() {
  const command = ['sleep 3']
  command.push(`curl http://127.0.0.1:${config.port}/api/spider/auto`)
  return command;
}
const setDeployENV = () => {
  const map = {};
  map[env] = Object.assign(
    {
      repo: pkg.repository.url,
      ref: "origin/master",
      host: ["127.0.0.1"],
      user: "root",
      path: WORKSPACE,
    },
    {
      "pre-setup": `mkdir -p ${WORKSPACE}`,
      "post-deploy": command.concat(curlBash()).join(" && "),
      env: {
        NODE_ENV: env,
      },
    },
    config.deploy
  );
  return map;
};
const LAUNCHED = {
  apps: [
    {
      name,
      script: "./node_modules/@colpu/cli/script/service.js",
      cwd: "./",
      instances: 2,
      max_restarts: 2,
      min_uptime: "1h",
      exec_mode: "cluster",
      max_memory_restart: "1024M",
      node_args: "--experimental-modules --es-module-specifier-resolution=node",
      env: {
        COMMON_VARIABLE: true,
        PM2_ESM: true, // 关键！启用 ESM 支持
      },
      env_local: {
        NODE_ENV: "local",
      },
      env_preview: {
        NODE_ENV: "preview",
      },
      env_release: {
        NODE_ENV: "release",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: `/data/logs/${name}_err.log`,
      out_file: `/data/logs/${name}_out.log`,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      type: "module", // 关键配置
      interpreter: "node", // 确保使用 Node.js
      interpreter_args: "--no-warnings",
    },
  ],
  deploy: setDeployENV(),
};
export default LAUNCHED;
