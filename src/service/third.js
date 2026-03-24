/**
 * @Author: colpu
 * @Date: 2026-03-24 15:11:09
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 22:35:53
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved. 
 */
import { Op, col } from "sequelize";
import Base from "./base.js";
import cryptoUtils from "../utils/crypto.js";
import { sysdb, thirdAuth, users } from "../models/sys/index.js";
const nicknameMap = {
  0: "未知",
  1: "微信",
  2: "QQ",
  // github: "GitHub",
  // weibo: "微博",
  // twitter: "Twitter",
  // facebook: "Facebook",
  // linkedin: "LinkedIn",
  // google: "Google",
  // apple: "Apple",
  // dingding: "钉钉",
  // lark: "飞书",
  // wechatwork: "企业微信",
  // alipay: "支付宝",

}
export default class ThirdAuthService extends Base {

  async create(params) {
    const { openid, type, unionid } = params;
    // 创建一个事务，作用是在整个事务中进行数据操作，如果某个操作失败，则整个事务回滚
    const transaction = await sysdb.transaction();
    try {
      // 1. 查询ThirdAuth 记录是否存在
      let thirdAuthRes = await thirdAuth.findOne({
        where: { openid, type },
        transaction,
      });
      let user = null;
      if (!thirdAuthRes) {
        user = await this._createAuthUser(params, transaction);
        thirdAuthRes = await thirdAuth.create({
          type,
          openid,
          unionid,
          isbind: 1, // 已绑定
        }, { transaction });
        // 建立user和thirdAuth关联，这里已有数据用：addThirdAuth方法关联
        await user.addThirdAuth(thirdAuthRes, { transaction });
      } else {
        // 已有第三方授权记录
        if (thirdAuthRes.isbind === 1) {
          // 已绑定：通过关联获取用户
          const usersRelated = await thirdAuthRes.getUsers({ transaction });
          if (!usersRelated || usersRelated.length === 0) {
            throw new Error('关联数据丢失');
          }
          user = usersRelated[0];
        } else {
          // 未绑定：创建新用户，更新第三方记录，建立关联
          user = await this._createAuthUser(params, transaction);

          // 更新第三方授权记录为已绑定
          await thirdAuthRes.update({ isbind: 1 }, { transaction });

          // 建立关联
          await user.addThirdAuth(thirdAuthRes, { transaction });
        }
      }
      // 提交事务
      await transaction.commit();
      return user.toJSON();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  }

  async _createAuthUser(params, transaction) {
    const { openid, type } = params;
    // 默认用户名，因为三方用户没有用户名称，只有唯一的openid, 
    // 这样做的目的是为了获取用户信息后，可以给一次修改用户名的机会
    const DEFAULT_USER_PRFIX = this.config.default_user_prfix || '@AU@_';
    const username = `${DEFAULT_USER_PRFIX}${cryptoUtils.md5(openid)}` + Date.now();
    const nickname = nicknameMap[type || '0'] + '用户';
    const avatar = "assets/gleaner.png";
    return users.create({
      username,
      nickname,
      avatar,
      lock_username: false, // 不锁定用户名，便于修改
    }, { transaction })
  }

  authBind(params) {

  }
  updateAuthBind(params) {

  }

}