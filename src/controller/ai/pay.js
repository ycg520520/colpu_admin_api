/**
 * @Author: colpu
 * @Date: 2026-05-14
 */
import { Controller } from "@colpu/core";
import Joi from "joi";
import { jsCode2Session } from "../../utils/wechat/virtual_pay.js";

export default class PayController extends Controller {
  async packages(ctx) {
    const packages = await this.service.ai.points.listRechargePackages();
    ctx.respond({ packages });
  }

  /**
   * 创建虚拟支付会话：需传 wx.login 的 code 以换取 session_key 计算用户态签名。
   */
  async createRecharge(ctx) {
    const { uid, client_id } = ctx.state.user || {};
    if (!client_id) {
      ctx.throw(400, "缺少 client_id，请使用小程序 OAuth 客户端登录");
    }
    const { product_id, login_code } = ctx.validate({
      body: {
        product_id: Joi.number().required(),
        login_code: Joi.string().required(),
      },
    });
    const { secret_key } = (await this.service.clients.findOne(client_id)) || {};
    if (!secret_key) {
      ctx.throw(503, "未找到小程序客户端密钥配置");
    }
    const appId = this.config.wx.appId;
    if (appId && client_id && client_id !== appId) {
      console.warn(
        "[virtual_pay] 登录小程序 client_id 与 config.wx.appId 不一致，paySig 可能失败：",
        { client_id, appId },
      );
    }
    const pkg = await this.service.ai.points.findRechargePackageById(product_id);
    if (!pkg) ctx.throw(400, "套餐不存在");
    const { sale_price, price, point, name, buy_quantity } = pkg;
    if (sale_price == null || sale_price <= 0) {
      ctx.throw(400, "套餐实付价（sale_price）无效");
    }
    if (price == null || price <= 0) {
      ctx.throw(400, "套餐标价（price）无效");
    }
    if (point == null || point <= 0) {
      ctx.throw(400, "套餐积分无效");
    }
    const description = pkg.description || name || "积分充值";
    const { session_key } = await jsCode2Session(client_id, secret_key, login_code);
    const data = await this.service.ai.points.createRechargeVirtualSession({
      uid,
      session_key,
      wx: this.config.wx,
      sale_price,
      price,
      point,
      description,
      product_id,
      buy_quantity: buy_quantity > 0 ? buy_quantity : 1,
    });
    ctx.respond(data);
  }
}
