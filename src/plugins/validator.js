/**
 * @Author: colpu
 * @Date: 2022-11-25 10:53:20
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-11-26 20:34:21
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import _ from "lodash";
import Joi from "joi";
class ValidationError extends Error {
  constructor(errors) {
    super(errors.message);
    this.status = errors.status || 422;
    this.errors = errors;
  }
}

class Validation {
  constructor(joi) {
    this.Joi = joi || Joi;
  }

  /**
   * @function validate 中间件验证
   * @param {Object} schema
   * {
   *   body: {},
   *   params: {},
   *   query: {},
   *   status: // 自定义错误状态码
   * }
   */
  validate(schema = {}) {
    const options = _.defaultsDeep(schema, {
      allowUnknown: true,
    });
    return async (ctx, next) => {
      this._validate(ctx, schema, options);
      await next();
    };
  }

  /**
   * @function validateAsync 中间件验证
   * @param {Object} schema
   * {
   *   body: {},
   *   params: {},
   *   query: {},
   *   status: // 自定义错误状态码
   * }
   */
  validateAsync(ctx) {
    return (schema = {}) => {
      const options = _.defaultsDeep(schema, {
        allowUnknown: true,
        timestamp: Date.now(),
      });
      return this._validate(ctx, schema, options);
    };
  }

  /**
   * @function validateAsync 中间件验证
   * @param {Object} schema
   * {
   *   body: {},
   *   params: {},
   *   query: {
      return this._validate(ctx, schema, options);
    };
  }

  /**
   * @function _validate 验证
   * @param {Context} ctx
   * @param {Object} schema
   * @param {Object} options
   */
  _validate(ctx, schema, options) {
    const defaultValidateKeys = ["body", "query", "params",];
    const needValidateKeys = _.intersection(
      defaultValidateKeys,
      Object.keys(schema)
    );
    let result = {};
    needValidateKeys.find((item) => {
      const toValidateObj = item === "body" ? ctx.request.body : ctx[item];
      const _schema = this.Joi.object(schema[item])
      result = _schema.validate(toValidateObj, options);
      if (result.error && result.error instanceof Error) {
        return true;
      }
      return false;
    });
    if (result.error && result.error.message instanceof Error) {
      const { status } = options;
      ctx.throw(new ValidationError({ message: result.error.message, status }));
    }
    // 返回验证后的值
    return result.value;
  }
}

// const defaultValidation = new Validation();
// module.exports = defaultValidation.validate.bind(defaultValidation);
// module.exports.ValidationError = ValidationError;
// module.exports.Validation = Validation;

/**
 * validate 验证插件
 * @param {Applaction} app
 *
 * 使用方法：
 * 1、通过中间件使用，如：
   router.get('*', app.validate({
     body: {
       name: Joi.string().required(),
       password: Joi.string().required(),
     }
   }))
 *
 * 2、在controller中使用
 * ctx.validateAsync({
      body: {
        name: Joi.string().required(),
        password: Joi.string().required(),
      },
      status: 10001
    });
 */
const validationInstance = new Validation();
const validate = validationInstance.validate.bind(validationInstance);
export default (app) => {
  app.validate = validate
  app.use((ctx, next) => {
    if (!ctx.validateAsync) {
      ctx.validateAsync = validationInstance.validateAsync(ctx);
    }
    return next();
  });
};
