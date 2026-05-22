/**
 * 运营后台：AI 模版管理
 */
import Base from "../../base.js";
import { Op } from "sequelize";
import {
  template,
  classify,
  classifyTemplate,
} from "../../../models/ai/index.js";
import { category } from "../../../models/sys/index.js";

function formatTemplateRow(row) {
  if (!row) return row;
  const r = typeof row.toJSON === "function" ? row.toJSON() : row;
  const classifies = r.Classifies || r.classifies || [];
  return {
    ...r,
    Classifies: undefined,
    classifies: undefined,
    classify_names: classifies.map((c) => c.name).filter(Boolean),
    classify_ids: classifies.map((c) => c.id),
  };
}

export default class AdminAiTemplateService extends Base {
  list(params) {
    const {
      page = 1,
      pageSize = 20,
      name,
      status,
      category_id,
      classify_id,
    } = params;
    const where = {};
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (category_id !== undefined && category_id !== "") {
      where.category_id = Number(category_id);
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    const include = [
      {
        model: classify,
        attributes: ["id", "name"],
        through: { attributes: [] },
        required: !!classify_id,
        ...(classify_id
          ? { where: { id: Number(classify_id) } }
          : {}),
      },
    ];

    return template
      .findAndCountAll({
        where,
        include,
        distinct: true,
        order: [
          ["sort_order", "DESC"],
          ["id", "DESC"],
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      .then((res) => ({
        rows: (res.rows || []).map(formatTemplateRow),
        count: res.count,
      }))
      .then((res) => this.composePaginationData(res, page, pageSize));
  }

  async findOne(id) {
    const row = await template.findByPk(id, {
      include: [
        {
          model: classify,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });
    if (!row) {
      throw Object.assign(new Error(`模版ID：${id}不存在`), { status: 404 });
    }
    return formatTemplateRow(row);
  }

  async create(data) {
    const { classify_ids, ...rest } = data;
    const row = await template.create(rest);
    if (classify_ids?.length) {
      await this.syncClassifies(row.id, classify_ids);
    }
    return this.findOne(row.id);
  }

  async update(data) {
    const { id, classify_ids, ...rest } = data;
    const row = await template.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`模版ID：${id}不存在`), { status: 404 });
    }
    await row.update(rest);
    if (classify_ids !== undefined) {
      await this.syncClassifies(id, classify_ids);
    }
    return this.findOne(id);
  }

  async delete(id) {
    const row = await template.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`模版ID：${id}不存在`), { status: 404 });
    }
    await row.update({ status: 0 });
    return true;
  }

  async syncClassifies(templateId, classifyIds = []) {
    await classifyTemplate.destroy({ where: { template_id: templateId } });
    const ids = [...new Set(classifyIds.map(Number).filter((n) => n > 0))];
    if (!ids.length) return;
    await classifyTemplate.bulkCreate(
      ids.map((classify_id) => ({
        classify_id,
        template_id: templateId,
      })),
    );
  }

  async categoryTree() {
    const rows = await category.findAll({
      where: { status: 1, type: 2 },
      order: [
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
    return this.utils.installTree(rows, { key_fid: "parent_id" });
  }

  /** 下拉：已上架 AI 项目 */
  async classifyOptions() {
    return classify.findAll({
      where: { status: 1 },
      attributes: ["id", "name"],
      order: [
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
  }
}
