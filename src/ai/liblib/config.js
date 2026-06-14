/**
 * @Author: colpu
 * @Date: 2026-05-28 11:37:47
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-02 17:30:46
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * Liblib 工作流配置（classify.model 为 liblib:{templateUuid}）
 * 当前仅注册老照片修复liblib:17182fd2311844079ccd49812b15cf97
 * 文档：https://www.liblib.art/apis/workflow?uuid=17182fd2311844079ccd49812b15cf97
 */
export const LIBLIB_CONFIG = {
  baseUrl: "https://openapi.liblibai.cloud",
  workflows: {
    "17182fd2311844079ccd49812b15cf97": {
      name: "老照片修复",
      templateUuid: "4df2efa0f18d46dc9758803e478eb51c",
      workflowUuid: "17182fd2311844079ccd49812b15cf97",
      defaultTemplateImage: "static/template/20260411_69d97488b0938.jpg",
      nodes: {
        loadImageOld: "131",
        loadImageTemplate: "132",
        repairText: "95",
        hintText: "100",
        sampler: "101",
        guidance: "99",
        scaleOld: "106",
        scaleTemplate: "107",
      },
    },
    "17182fd2311844079ccd49812b15cf97": {
      name: "老照片修复",
      templateUuid: "4df2efa0f18d46dc9758803e478eb51c",
      workflowUuid: "17182fd2311844079ccd49812b15cf97",
      nodes: {
        "326": "LoadImage",
      },
    },
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
