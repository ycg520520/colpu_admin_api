/**
 * 运营后台 AI：/api/admin/ai/*
 */
import verify from "../../decorator/verify.js";

export default (app) => {
  const { controller, childRouter, useChildRouter } = app;
  const router = childRouter({ prefix: "/admin/ai" });
  const {
    orders,
    points,
    stats,
    classify,
    ads,
    template,
    classifyExtend,
  } = controller.admin.ai;

  router.get("/orders", verify, orders.list);
  router.get("/orders/:id", verify, orders.findOne);
  router.post("/orders/:id/refund", verify, orders.refund);
  router.post("/orders/:id/close", verify, orders.close);

  router.get("/point-logs", verify, points.list);
  router.post("/points/refund-consume", verify, points.refundConsume);

  router.get("/stats/overview", verify, stats.overview);
  router.get("/stats/trend", verify, stats.trend);

  router.get("/classify/list", verify, classify.list);
  router.get("/classify/:id", verify, classify.findOne);
  router.post("/classify", verify, classify.create);
  router.put("/classify", verify, classify.update);
  router.delete("/classify/:id", verify, classify.delete);

  router.get("/templates/categories", verify, template.categories);
  router.get("/templates/classify-options", verify, template.classifyOptions);
  router.get("/templates/list", verify, template.list);
  router.get("/templates/:id", verify, template.findOne);
  router.post("/templates", verify, template.create);
  router.put("/templates", verify, template.update);
  router.delete("/templates/:id", verify, template.delete);

  router.get("/extends/classify-options", verify, classifyExtend.classifyOptions);
  router.get("/extends/list", verify, classifyExtend.list);
  router.get("/extends/:id", verify, classifyExtend.findOne);
  router.post("/extends", verify, classifyExtend.create);
  router.put("/extends", verify, classifyExtend.update);
  router.delete("/extends/:id", verify, classifyExtend.delete);

  router.get("/ads", verify, ads.list);
  router.get("/ads/settings", verify, ads.getSettings);
  router.put("/ads/settings", verify, ads.updateSettings);
  router.get("/ads/:id", verify, ads.findOne);
  router.post("/ads", verify, ads.create);
  router.put("/ads", verify, ads.update);
  router.delete("/ads/:id", verify, ads.delete);

  useChildRouter(router);
};
