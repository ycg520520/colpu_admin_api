/**
 * @Author: colpu
 * @Date: 2026-05-08 16:22:26
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-06-05 16:08:55
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * Bailian / Viapi / Comfy 的 SDK 实例表 **`createClients`** → `{ viapi, bailian?, comfyui? }`：
 */
import Bailian from "./bailian.js";
import AliViapi from "./viapi.js";
import ComfyUI from "./comfyui/index.js";
import LiblibAI from "./liblib/client.js";
import RunningHub from "./runninghub/client.js";
import AliOSS from "./alioss.js";

/**
 * @param {{ aikeys?: { ali_bailian?: string }, ossOption: object, comfyOption?: object, liblibOption?: object, runninghubOption?: object }} option
 * @returns {{ viapi, bailian?, comfyui?, liblib?, runninghub? }}
 */
export function createClients(option) {
  const { aikeys, ossOption, comfyOption, liblibOption, runninghubOption } = option;
  if (!ossOption) {
    throw new Error("createClients: ossOption is required");
  }
  const ossClient = new AliOSS(ossOption)
  const viapi = new AliViapi({ ...ossOption, ossClient });
  /** @type {{ viapi: import("./viapi.js").default, bailian?: import("./bailian.js").default, comfyui?: import("./comfyui/index.js").default }} */
  const clients = { viapi, ossClient };
  if (aikeys?.ali_bailian) {
    clients.bailian = new Bailian({
      apikey: aikeys.ali_bailian,
      ossClient,
    });
  }

  if (comfyOption?.baseUrl) {
    clients.comfyui = new ComfyUI({
      ...comfyOption,
      baseUrl: String(comfyOption.baseUrl).replace(/\/$/, ""),
      ossClient,
    });
  }

  if (liblibOption?.accessKey && liblibOption?.secretKey) {
    clients.liblib = new LiblibAI({
      accessKey: liblibOption.accessKey,
      secretKey: liblibOption.secretKey,
      ossClient,
      workflows: liblibOption.workflows,
      publicAssetsBase: liblibOption.publicAssetsBase ?? ossOption?.domain,
    });
  }

  if (runninghubOption?.apiKey) {
    clients.runninghub = new RunningHub({
      apiKey: runninghubOption.apiKey,
      baseUrl: runninghubOption.baseUrl,
      ossClient,
      workflows: runninghubOption.workflows,
      webhookUrl: runninghubOption.webhookUrl,
    });
  }

  return clients;
}
