/**
 * @Author: colpu
 * @Date: 2025-09-18 08:23:14
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 22:43:51
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
import bcrypt from 'bcryptjs';
import cryptoUtils from "../../utils/crypto.js";
import config from "../../config/index.js";
import statusFn from "../../constants/status.js";
export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      allowNull: false,
      comment: "用户ID",
      set(value) {
        if (!value) return;
        let uuidValue = value;
        if (typeof value === 'string') {
          // 移除UUID中的破折号
          uuidValue = value.replace(/-/g, '');
        }
        this.setDataValue('id', uuidValue);
      }
    },
    uid: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "idx_uid",
      comment: "用户uid唯一值",
      set(value) {
        if (!value) return;
        this.setDataValue('uid', value);
      }
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "用户头像",
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      unique: "idx_username",
      comment: "用户账号",
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "用户昵称",
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "",
      comment: "用户密码",
    },
    year: {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "出生日期",
    },
    gender: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: "性别",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "idx_phone",
      comment: "电话号码",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "idx_email",
      comment: "用户邮箱",
    },
    status: statusFn(),
    editable: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "编辑状态，0可编辑，1禁止编辑",
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "国家",
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "省份",
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "城市",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "最后登录时间",
    },
    remark: {
      type: DataTypes.STRING(500),  // 字符串类型，长度500
      comment: '描述'  // 字段注释
    },
    lock_username: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "锁定用户名，0-不锁的，1-锁定",
    },
  },
    {
      tableName: "users",
      comment: "用户表",
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "idx_id",
          unique: true,
          fields: ["id"],
        },
        {
          name: "idx_uid",
          unique: true,
          fields: ["uid"],
        },
        {
          name: "idx_username",
          unique: true,
          fields: ["username"],
        },
        {
          name: "idx_email",
          unique: true,
          fields: ["email"],
        },
        {
          name: "idx_phone",
          unique: true,
          fields: ["phone"],
        },
      ],
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.setPassword();
          }
          user.setId(user.id);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.setPassword();
          }
        },
        beforeValidate: (user, options) => {
          if (!user.id) {
            user.id = user.generateUID(Date.now() + Math.random()).toLocaleLowerCase();
          }
          // 插入前检查用户名是否可编辑
          if (user.username.indexOf('@AU@_') === 0) {
            user.lock_username = false;
          }
          // 在验证前处理数据
          if (!user.uid && user.username) {
            user.uid = user.generateUID(user.username);
          }
        }
      },
    }
  );

  User.prototype.setPassword = function () {
    const salt = bcrypt.genSaltSync(12);
    this.password = bcrypt.hashSync(this.password, salt);
  }
  User.prototype.setId = function (value) {
    this.id = value;
  }
  User.prototype.generateUID = (value) => {
    const { mixin } = config || {};
    const uid = cryptoUtils.md5(
      cryptoUtils.encryptAes("aes-128-ecb", mixin.aesKey, "", `${value}${mixin.salt}}`)
    );
    return uid.toLocaleUpperCase();
  }

  // 实例方法
  User.prototype.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };
  return User;
}

