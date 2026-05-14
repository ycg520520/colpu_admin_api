/**
 * @Author: colpu
 * @Date: 2026-05-08 16:22:26
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-05-09 17:25:45
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
/**
 * Bailian / Viapi / Comfy 的 SDK 实例表 **`createClients`** → `{ viapi, bailian?, comfyui? }`：
 */
import Bailian from "./bailian.js";
import AliViapi from "./viapi.js";
import ComfyUI from "../../ai/comfyui/index.js";

/**
 * @param {{ aikeys?: { ali_bailian?: string }, ossOption: object, comfyOption?: { baseUrl: string } }} option
 * @returns {{ viapi: import("./viapi.js").default, bailian?: import("./bailian.js").default, comfyui?: import("../../ai/comfyui/index.js").default }}
 */
export function createClients(option) {
  const { aikeys, ossOption, comfyOption } = option;
  if (!ossOption) {
    throw new Error("createClients: ossOption is required");
  }
  const viapi = new AliViapi(ossOption);
  /** @type {{ viapi: import("./viapi.js").default, bailian?: import("./bailian.js").default, comfyui?: import("../../ai/comfyui/index.js").default }} */
  const clients = { viapi };
  if (aikeys?.ali_bailian) {
    clients.bailian = new Bailian({
      apikey: aikeys.ali_bailian,
      ossOption,
    });
  }

  if (comfyOption?.baseUrl) {
    clients.comfyui = new ComfyUI({
      ...comfyOption,
      baseUrl: String(comfyOption.baseUrl).replace(/\/$/, ""),
      ossOption,
      assetsBaseUrl:
        comfyOption.assetsBaseUrl ?? comfyOption.publicAssetsBase ?? ossOption?.domain ?? "",
    });
  }

  return clients;
}
