/**
 * @Author: colpu
 * @Date: 2026-05-28 11:37:47
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-16 14:53:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * Liblib 工作流配置（classify.model 为 liblib:{templateUuid}）
 */
export const LIBLIB_CONFIG = {
  baseUrl: "https://openapi.liblibai.cloud",
  workflows: {
    // https://www.liblib.art/modelinfo/7952a904a5674407a89c16075f33f4c8?versionUuid=17182fd2311844079ccd49812b15cf97
    // https://www.liblib.art/apis/workflow?uuid=17182fd2311844079ccd49812b15cf97
    "17182fd2311844079ccd49812b15cf97": {
      name: "老照片修复1",
      templateUuid: "4df2efa0f18d46dc9758803e478eb51c",
      workflowUuid: "17182fd2311844079ccd49812b15cf97",
      nodes: {
        "326": "LoadImage",
      },
    },
    // https://www.liblib.art/modelinfo/c0e129bccd794e62932dd9552d79e520?versionUuid=485582355f1b4e07a6a962380bae2292
    // https://www.liblib.art/apis/workflow?uuid=485582355f1b4e07a6a962380bae2292
    "485582355f1b4e07a6a962380bae2292": {
      name: "老照片修复2",
      templateUuid: "4df2efa0f18d46dc9758803e478eb51c",
      workflowUuid: "485582355f1b4e07a6a962380bae2292",
      nodes: {
        "14": "GeminiImage2Node",
        "15": "LoadImage",
      },
    },
  },
};

/**
 * @param {object} [optionOverrides] - .config.js liblibOption.workflows
 * @returns {{ baseUrl: string, workflows: Record<string, object> }}
 */
export function loadLiblibConfig(optionOverrides) {
  const { baseUrl, workflows } = LIBLIB_CONFIG;
  const merged = {
    ...workflows,
    ...(optionOverrides && typeof optionOverrides === "object" ? optionOverrides : {}),
  };
  return {
    baseUrl: String(baseUrl).replace(/\/$/, ""),
    workflows: merged,
  };
}
