/**
 * 运营后台：AI 模版管理
 */
import Base from "../base.js";
import { Op, col } from "sequelize";
import {
  template,
  classify,
  classifyTemplate,
  categoryTemplate,
  templateGroup,
} from "../../models/ai/index.js";
import { category } from "../../models/sys/index.js";

function formatTemplateRow(raw) {
  if (!raw) return raw;
  const r = typeof raw.toJSON === "function" ? raw.toJSON() : raw;
  const classifies = r.Classifies || r.classifies || [];
  return {
    ...r,
    Classifies: undefined,
    classifies: undefined,
    classify_names: classifies.map((c) => c.name).filter(Boolean),
    classify_ids: classifies.map((c) => c.id),
  };
}

export default class AiTemplateService extends Base {
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
          attributes: [],
          through: { attributes: [] },
          nested: false,
        },
      ],
      attributes: {
        include: [
          [col('Classifies.name'), 'classify_name'],
          [col('Classifies.id'), 'classify_id'],
        ]
      },
      raw: true,
    });
    if (!row) {
      throw Object.assign(new Error(`模版ID：${id}不存在`), { status: 404 });
    }

    // const templateIds = [row.id];
    // const relations = await categoryTemplate.findAll({
    //   where: {
    //     template_id: templateIds
    //   },
    //   attributes: ['category_id'],
    //   raw: true
    // });
    // row.category_ids = relations.map(rel => rel.category_id)
    const relations = await categoryTemplate.findOne({
      where: {
        template_id: row.id
      },
      attributes: ['category_id'],
      raw: true
    });
    row.category_id = relations.category_id
    return row;
  }

  async create(data) {
    const { classify_id,
      // category_ids,
      ...rest } = data;
    const row = await template.create(rest);
    if (classify_id) {
      await this.syncClassify(row.id, classify_id);
    }
    // if (category_ids !== undefined) {
    //   await this.syncCategorys(row.id, category_ids);
    // }
    return this.findOne(row.id);
  }

  async update(data) {
    const { id, classify_id,
      // category_ids,
      ...rest } = data;
    const row = await template.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`模版ID：${id}不存在`), { status: 404 });
    }
    await row.update(rest);
    if (classify_id !== undefined) {
      await this.syncClassify(id, classify_id);
    }
    // if (category_ids !== undefined) {
    //   await this.syncCategorys(id, category_ids);
    // }
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

  async syncClassify(template_id, classify_id) {
    await classifyTemplate.destroy({ where: { template_id } });
    await classifyTemplate.create({
      classify_id,
      template_id,
    });
  }
  async syncCategorys(template_id, category_ids = []) {
    await categoryTemplate.destroy({ where: { template_id } });
    const ids = [...new Set(category_ids.map(Number).filter((n) => n > 0))];
    if (!ids.length) return;
    await categoryTemplate.bulkCreate(
      ids.map((category_id) => ({
        category_id,
        template_id,
      })),
    );
  }
}
