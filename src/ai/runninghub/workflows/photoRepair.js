/**
 * @Author: colpu
 * @Date: 2026-06-15 15:28:57
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-16 13:56:13
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
import { firstImage } from "../../utils.js";
import { assertWorkflowNodes, getNodeInfoList, collectVarMap, parseHD } from "../config.js";
const NODES = {
  loadImage: "191", // 加载图片
};

function setNodeInfoList(data, wf) {
  const { body = {}, templates, classify, seed } = data;
  const promptVariables = collectVarMap(body.prompt_variables);
  const map = {};
  const set = (nodeId, inputs) => {
    map[nodeId] = { ...(map[nodeId] || {}), ...inputs };
  };

  // 设置上传图片
  const imageUrl = firstImage(body.images);
  if (!imageUrl) {
    throw new Error("需要 body.images[0]：用户上传图片可访问URL");
  }
  set(NODES.loadImage, { image: imageUrl });

  // 节点信息列表
  const nodeInfoList = getNodeInfoList(map)
  return { nodeInfoList };
}
function setWorkflow(workflow, params = {}) {
  return workflow;
}

export default function buildRunPayload(data, wf) {
  // 判断工作流节点是否完整
  const schema = assertWorkflowNodes(wf, NODES);

  const { nodeInfoList } = setNodeInfoList(data, wf);

  const workflow = JSON.parse(JSON.stringify(schema));
  setWorkflow(workflow, { ...data });

  return {
    nodeInfoList,
    workflow: JSON.stringify(workflow),
  };
}
