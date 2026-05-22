/**
 * 运营后台：AI 项目（classify）管理
 */
import Base from "../../base.js";
import { classify, classifyTemplate, template } from "../../../models/ai/index.js";
import { Op } from "sequelize";

export default class AdminAiClassifyService extends Base {
  list(params) {
    const {
      page = 1,
      pageSize = 20,
      name,
      status,
      disabled,
    } = params;
    const where = {};
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (disabled !== undefined && disabled !== "") {
      where.disabled = Number(disabled);
    }
    const orArr = [];
    if (name) {
      orArr.push({ name: { [Op.like]: `%${name}%` } });
    }
    if (orArr.length) {
      where[Op.or] = orArr;
    }

    return classify
      .findAndCountAll({
        where,
        order: [
          ["sort_order", "DESC"],
          ["id", "ASC"],
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        raw: true,
      })
      .then((res) => this.composePaginationData(res, page, pageSize));
  }

  async findOne(id) {
    const row = await classify.findByPk(id, {
      include: [
        {
          model: template,
          attributes: ["id", "name", "img_src", "status"],
          through: { attributes: [] },
        },
      ],
    });
    if (!row) {
      throw Object.assign(new Error(`分类ID：${id}不存在`), { status: 404 });
    }
    const json = row.toJSON();
    const templates = json.Templates || json.templates || [];
    return {
      ...json,
      Templates: undefined,
      templates: undefined,
      template_ids: templates.map((t) => t.id),
      templates,
    };
  }

  async create(data) {
    const { template_ids, ...rest } = data;
    const row = await this.service.ai.classify.create(rest);
    if (template_ids?.length) {
      await this.syncTemplates(row.id, template_ids);
    }
    return this.findOne(row.id);
  }

  async update(data) {
    const { template_ids, ...rest } = data;
    const row = await this.service.ai.classify.update(rest);
    if (template_ids !== undefined) {
      await this.syncTemplates(data.id, template_ids);
    }
    return this.findOne(data.id);
  }

  async syncTemplates(classifyId, templateIds = []) {
    await classifyTemplate.destroy({ where: { classify_id: classifyId } });
    const ids = [...new Set(templateIds.map(Number).filter((n) => n > 0))];
    if (!ids.length) return;
    await classifyTemplate.bulkCreate(
      ids.map((template_id) => ({
        classify_id: classifyId,
        template_id,
      })),
    );
  }

  async delete(id) {
    const res = await classify.findByPk(id);
    if (!res) {
      throw Object.assign(new Error(`分类ID：${id}不存在`), { status: 404 });
    }
    await res.update({ status: 0 });
    return true;
  }
}
