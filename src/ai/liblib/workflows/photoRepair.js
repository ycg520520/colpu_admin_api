/**
 * @Author: colpu
 * @Date: 2026-06-02 13:41:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-15 16:39:04
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

/**
 * 构建 Liblib ComfyUI App 的 generateParams（含 workflowUuid 与各节点覆盖）
 */
export default function photoRepair(wf, data) {
  const {
    prompt,
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
