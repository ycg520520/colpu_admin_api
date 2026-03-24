/**
 * @Author: colpu
 * @Date: 2025-10-28 22:06:05
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-24 21:31:35
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import DbInstances from "../../utils/db/index.js";
import { dictDataModel, dictTypesModel } from "./dict.js";
import { languagesModel, translationsModel } from "./languages.js";

export const db = DbInstances.mysql;
export const sysdb = db.use("colpusys"); // 导出sequelize实例

// 用户表
export const users = (await import("./users.js")).default(sysdb);

// 客服端表
export const clients = (await import("./clients.js")).default(sysdb);

// 语言表
export const languages = languagesModel(sysdb);
export const translations = translationsModel(sysdb);
// 字典表
export const dictData = dictDataModel(sysdb);
export const dictTypes = dictTypesModel(sysdb);
dictTypes.hasMany(dictData, {
  foreignKey: 'type_code',
  sourceKey: 'type_code'
});
dictData.belongsTo(dictTypes, {
  as: 'DictType',
  foreignKey: 'type_code',
  targetKey: 'type_code'
});

// 部门表
export const departments = (await import("./departments.js")).default(sysdb);
export const userDepartments = (await import("./user_departments.js")).default(sysdb);
// 岗位表
export const post = (await import("./post.js")).default(sysdb);
export const userPost = (await import("./user_post.js")).default(sysdb);

// 菜单表
export const menus = (await import("./menus.js")).default(sysdb);
// 角色表
export const roles = (await import("./roles.js")).default(sysdb);
// 权限表
export const permissions = (await import("./permissions.js")).default(sysdb);
// 用户权限关联表
export const userPermission = (await import("./user_permission.js")).default(sysdb);
// 角色权限关联表
export const rolePermission = (await import("./role_permission.js")).default(sysdb);
// 角色用户关联表
export const roleUsers = (await import("./role_users.js")).default(sysdb, roles, users);
// 日志记录表
export const logger = (await import("./logger.js")).default(sysdb);

// 角色菜单关联表
// export const roleMenus = (await import("./role_menus.js")).default(sysdb, roles, menus);
// 数据权限范围表
// export const rolePermissionScope = (await import("./role_permission_scope.js")).default(sysdb);

export const thirdAuth = (await import("./third_auth.js")).default(sysdb);
export const userThirdAuth = (await import("./user_third_auth.js")).default(sysdb);


// 用户角色权限关联关系
roles.belongsToMany(users, {
  through: roleUsers,
  foreignKey: 'role_id',
  otherKey: 'user_id',
});
users.belongsToMany(roles, {
  through: roleUsers,
  foreignKey: 'user_id',
  otherKey: 'role_id',
});

// 角色权限关联关系
roles.belongsToMany(permissions, {
  through: rolePermission,
  foreignKey: 'role_id',
  otherKey: 'perm_id',
});
permissions.belongsToMany(roles, {
  through: rolePermission,
  foreignKey: 'perm_id',
  otherKey: 'role_id',
});

// 用户权限关联关系
users.belongsToMany(permissions, {
  through: userPermission,
  foreignKey: 'user_id',
  otherKey: 'perm_id',
});
permissions.belongsToMany(users, {
  through: userPermission,
  foreignKey: 'perm_id',
  otherKey: 'user_id',
});

// 用户部门关联关系
users.belongsToMany(departments, {
  through: userDepartments,
  foreignKey: 'user_id',
  otherKey: 'dept_id',
})
departments.belongsToMany(users, {
  through: userDepartments,
  foreignKey: 'dept_id',
  otherKey: 'user_id',
})

// 用户岗位关联关系
users.belongsToMany(post, {
  through: userPost,
  foreignKey: 'user_id',
  otherKey: 'post_id',
})
post.belongsToMany(users, {
  through: userPost,
  foreignKey: 'post_id',
  otherKey: 'user_id',
})

// 用户授权（三方授权）关联关系
users.belongsToMany(thirdAuth, {
  through: userThirdAuth,
  foreignKey: 'user_id',        // userThirdAuth 中指向 User 的字段
  otherKey: 'openid',           // userThirdAuth 中指向 ThirdAuth 的字段
  sourceKey: 'id',              // User 使用主键 id 作为关联源
  targetKey: 'openid',          // ThirdAuth 使用 openid 作为关联目标
});

thirdAuth.belongsToMany(users, {
  through: userThirdAuth,
  foreignKey: 'openid',
  otherKey: 'user_id',
  sourceKey: 'openid',
  targetKey: 'id',
});

// belongsToMany 是多对多关系，需要通过中间表来建立关联关系
// sourceKey 不适用belongsToMany，因为belongsToMany会自动使用主键作为关联字段
// A.belongsToMany(B, {
//   through: aB,
//   foreignKey: 'A_id',// 中间表(aB)的字段A_id指向A的id字段
//   otherKey: 'B_id', // 中间表(aB)的字段B_id指向B的id字段
// });
// B.belongsToMany(A, {
//   through: aB,
//   foreignKey: 'B_id',// 中间表(aB)的字段B_id指向B的id字段
//   otherKey: 'A_id', // 中间表(aB)的字段A_id指向A的id字段
// });

// hasMany 和 belongsTo 是相反的，前者是“拥有”关系，后者是“属于”关系
// A.hasMany(B, {
//   foreignKey: 'A_id', // 指目标模型表(B)中的A_id字段
//   sourceKey: 'id', // 指当前模型(A)的主键字段（默认为id）
// });
// B.belongsTo(A, {
//   foreignKey: 'A_id', // 指当前模型表(B)中的A_id字段
//   sourceKey: 'id', // 指目标模型(A)的主键字段（默认为id）
// });


