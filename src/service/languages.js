/**
 * @Author: colpu
 * @Date: 2025-10-31 09:15:52
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-10-31 09:55:32
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import Base from "./base.js";
import { languages, translations } from "../models/sys/index.js";
export default class LanguageService extends Base {
  constructor() {
    this.LanguagePack = languages;
    this.Translation = translations;
    this.cache = new Map(); // 简单缓存，生产环境可用 Redis
  }

  // 获取所有激活的语言
  async getActiveLanguages() {
    return await this.LanguagePack.findAll({
      where: { is_active: true },
      attributes: ['code', 'name', 'native_name', 'is_default']
    });
  }

  // 获取默认语言
  async getDefaultLanguage() {
    return await this.LanguagePack.findOne({
      where: { is_default: true, is_active: true }
    });
  }

  // 加载指定语言和命名空间的翻译
  async loadTranslations(languageCode, namespace = 'common') {
    const cacheKey = `${languageCode}:${namespace}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const translations = await this.Translation.findAll({
      where: { language_code: languageCode, namespace },
      attributes: ['key', 'value']
    });

    const translationMap = {};
    translations.forEach(item => {
      translationMap[item.key] = item.value;
    });

    this.cache.set(cacheKey, translationMap);
    return translationMap;
  }

  // 预加载多个命名空间
  async preloadNamespaces(languageCode, namespaces = ['common']) {
    const results = {};
    for (const namespace of namespaces) {
      results[namespace] = await this.loadTranslations(languageCode, namespace);
    }
    return results;
  }

  // 清除缓存
  clearCache(languageCode = null, namespace = null) {
    if (languageCode && namespace) {
      this.cache.delete(`${languageCode}:${namespace}`);
    } else if (languageCode) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${languageCode}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // 添加或更新翻译
  async upsertTranslation(languageCode, namespace, key, value) {
    const [translation] = await this.Translation.upsert({
      language_code: languageCode,
      namespace,
      key,
      value
    }, {
      conflictFields: ['language_code', 'namespace', 'key']
    });

    this.clearCache(languageCode, namespace);
    return translation;
  }

  // 批量导入翻译
  async importTranslations(languageCode, namespace, translations) {
    const transaction = await this.Translation.sequelize.transaction();

    try {
      // 删除该命名空间下的现有翻译
      await this.Translation.destroy({
        where: { language_code: languageCode, namespace },
        transaction
      });

      // 批量插入新翻译
      const translationData = Object.entries(translations).map(([key, value]) => ({
        language_code: languageCode,
        namespace,
        key,
        value
      }));

      await this.Translation.bulkCreate(translationData, { transaction });
      await transaction.commit();

      this.clearCache(languageCode, namespace);
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
