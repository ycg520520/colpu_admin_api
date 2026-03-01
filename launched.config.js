/**
 * @Author: colpu
 * @Date: 2025-03-31 17:37:38
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-01 22:30:10
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
const WORKSPACE = `/var/www/${name}`;
const command = [
  "git fetch",
  "npm install --no-lockfile --omit=dev",
  `pm2 startOrRestart launched.config.json --env ${env}`,
  'pm2 save && pm2 startup'
];
function deployLocal() {
  return config.deploy.host.map(ip => {
    return [`scp -r ./.config.js root@${ip}:${WORKSPACE}/current/.config.js`,
    `scp -r ./launched.config.json root@${ip}:${WORKSPACE}/current/launched.config.json`].join(" && ");
  }).join(" && ");
}
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
      "pre-deploy-local": deployLocal(),
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
      env_preview: {
        NODE_ENV: "preview",
      },
      env_release: {
        NODE_ENV: "release",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: `/var/logs/${name}_err.log`,
      out_file: `/var/logs/${name}_out.log`,
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
