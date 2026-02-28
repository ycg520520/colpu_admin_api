/**
 * @Author: colpu
 * @Date: 2025-12-15 16:22:53
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 16:28:07
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
/**
 * @Author: colpu
 * @Date: 2025-10-28 22:05:14
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2025-12-15 16:21:40
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { db, users, menus, dictTypes, dictData, roles, departments, post, permissions } from '../src/models/sys/index.js';
export default async () => {
  console.log('🚀 Starting MySQL data initialization...');
  try {
    // 同步数据库
    await db.initDatabase('colpusys'); // 初始数据库
    console.log('✅ Database synchronized');
    // 创建管理员用户
    for (const item of (await import('./data/sys/users.js')).default) {
      await users.create(item);
    }
    console.log('✅ Created user completed');
    // 创建菜单
    for (const item of (await import('./data/sys/menus.js')).default) {
      await menus.create(item);
    }
    console.log('✅ Created menus completed');

    // 创建字典类型
    for (const item of (await import('./data/sys/dict_types.js')).default) {
      await dictTypes.create(item);
    }

    console.log('✅ Created dictTypes completed');
    // 创建字典数据
    for (const item of (await import('./data/sys/dict_data.js')).default) {
      await dictData.create(item);
    }

    // 创建角色
    for (const item of (await import('./data/sys/roles.js')).default) {
      await roles.create(item);
    }
    console.log('✅ Created roles completed');


    // 创建部门
    for (const item of (await import('./data/sys/departments.js')).default) {
      await departments.create(item);
    }
    console.log('✅ Created departments completed');

    // 创建岗位
    for (const item of (await import('./data/sys/post.js')).default) {
      await post.create(item);
    }
    console.log('✅ Created post completed');


    // 创建权限
    for (const item of (await import('./data/sys/permissions.js')).default) {
      await permissions.create(item);
    }
    console.log('✅ Created permissions completed');

    // 为角色分配用户
    for (const item of (await import('./data/sys/role_user.js')).default) {
      const role = await roles.findByPk(item.role_id);
      await role.addUsers([item.user_id])
    }

    // 为角色分配权限
    for (const item of (await import('./data/sys/role_permission.js')).default) {
      const perm = await permissions.findByPk(item.perm_id);
      await perm.addRoles([item.role_id]);
    }
    // 为用户分配权限
    for (const item of (await import('./data/sys/user_permission.js')).default) {
      const perm = await permissions.findByPk(item.perm_id);
      await perm.addUsers([item.user_id]);
    }

    // 创建客户端
    console.log('🎉 Data install completed successfully!');
  } catch (error) {
    console.error('❌ Data install failed:', error);
  }
};
