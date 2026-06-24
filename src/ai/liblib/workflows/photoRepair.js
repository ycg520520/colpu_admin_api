/**
 * @Author: colpu
 * @Date: 2026-06-02 13:41:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-24 16:35:22
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

/**
 * 构建 Liblib ComfyUI App 的 generateParams（含 workflowUuid 与各节点覆盖）
 */
export default function photoRepair(wf, data) {
  const {
    prompt,
    size,
    images = [],
  } = data;

  const nodes = wf.nodes || {};
  const generateParams = {}
  Object.keys(nodes).forEach(key => {
    const class_type = nodes[key];
    const parmas = {
      class_type
    };
    switch (class_type) {
      case "GeminiImage2Node":
        parmas.inputs = { prompt };
        break;
      case "easy int":
        parmas.inputs = { value: size === "1K" ? 1024 : 2048 };
        break;
      case "LoadImage":
        parmas.inputs = { image: images[0] };
        break;
      default:
        break;
    }
    generateParams[key] = parmas;
  });

  return {
    workflowUuid: wf.workflowUuid,
    ...generateParams,
  };
}
