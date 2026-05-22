/**
 * 运营后台：AI 分类扩展（首页技能/画廊）
 */
import Base from "../../base.js";
import { Op } from "sequelize";
import { classifyExtend, classify } from "../../../models/ai/index.js";

function formatRow(row) {
  if (!row) return row;
  const r = typeof row.toJSON === "function" ? row.toJSON() : row;
  const c = r.c || r.Classify || {};
  return {
    ...r,
    c: undefined,
    Classify: undefined,
    classify_name: c.name,
    classify_model: c.model,
  };
}

export default class AdminAiClassifyExtendService extends Base {
  list(params) {
    const {
      page = 1,
      pageSize = 20,
      classify_id,
      status,
      feature,
    } = params;
    const where = {};
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (classify_id !== undefined && classify_id !== "") {
      where.classify_id = Number(classify_id);
    }
    if (feature) {
      where.feature = { [Op.like]: `%${feature}%` };
    }

    return classifyExtend
      .findAndCountAll({
        where,
        include: [
          {
            model: classify,
            as: "c",
            attributes: ["id", "name", "model"],
            required: false,
          },
        ],
        order: [
          ["id", "DESC"],
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      .then((res) => ({
        rows: (res.rows || []).map(formatRow),
        count: res.count,
      }))
      .then((res) => this.composePaginationData(res, page, pageSize));
  }

  async findOne(id) {
    const row = await classifyExtend.findByPk(id, {
      include: [
        {
          model: classify,
          as: "c",
          attributes: ["id", "name", "model"],
        },
      ],
    });
    if (!row) {
      throw Object.assign(new Error(`分类扩展ID：${id}不存在`), {
        status: 404,
      });
    }
    return formatRow(row);
  }

  async create(data) {
    const classifyRow = await classify.findByPk(data.classify_id);
    if (!classifyRow) {
      throw Object.assign(new Error("关联的 AI 项目不存在"), { status: 400 });
    }
    const row = await classifyExtend.create(data);
    return this.findOne(row.id);
  }

  async update(data) {
    const { id, ...rest } = data;
    const row = await classifyExtend.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`分类扩展ID：${id}不存在`), {
        status: 404,
      });
    }
    if (rest.classify_id !== undefined) {
      const classifyRow = await classify.findByPk(rest.classify_id);
      if (!classifyRow) {
        throw Object.assign(new Error("关联的 AI 项目不存在"), { status: 400 });
      }
    }
    await row.update(rest);
    return this.findOne(id);
  }

  async delete(id) {
    const row = await classifyExtend.findByPk(id);
    if (!row) {
      throw Object.assign(new Error(`分类扩展ID：${id}不存在`), {
        status: 404,
      });
    }
    await row.update({ status: 0 });
    return true;
  }

  classifyOptions() {
    return classify.findAll({
      where: { status: 1 },
      attributes: ["id", "name", "model"],
      order: [
        ["sort_order", "DESC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
  }
}
