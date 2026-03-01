/**
 * @Author: colpu
 * @Date: 2025-10-28 21:57:16
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-02 00:17:31
 * @
 * @Copyright (c) 2025 by colpu, All Rights Reserved.
 */
import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Menus = sequelize.define('Menus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键ID'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references: {
      //   model: "Menus", // 自关联
      //   key: 'id'
      // },
      comment: '父级ID'
    },
    menu_type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '菜单类型:0-布局, 1-目录, 2-菜单, 3-按钮',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '菜单名称'
    },
    perm_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '权限编码，用于前端权限控制'
    },
    path: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '路由地址'
    },
    layout: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '路由使用的布局组件，如MainLayout等，默认无布局。layout字段只能在目录层级使用，菜单和按钮层级无效'
    },
    query: {
      type: DataTypes.STRING(250),
      allowNull: true,
      comment: '路由参数'
    },
    lazy: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '前端组件'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '菜单图标'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '菜单页面标题'
    },
    keywords: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '菜单页面关键词'
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '菜单页面描述'
    },
    ns: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '翻译命名空间'
    },
    translation_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '翻译key'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    index: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否为首页'
    },
    is_link: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否外链'
    },
    hide_child_in_menu: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否隐藏子菜单'
    },
    hide_in_menu: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否显示在菜单中'
    },
    hide_title: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否显示标题'
    },
    is_cache: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否缓存'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "用户状态，0表示禁用，1表示启用",
    },
    redirect: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '重定向路径'
    }
  }, {
    tableName: 'menus',
    comment: '菜单表',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      //   beforeCreate: async (menu) => {
      //     if (menu.parent_id) {
      //       const parent = await Menu.findByPk(menu.parent_id);
      //       if (!parent) {
      //         throw new Error('父级菜单不存在');
      //       }
      //     }
      //   },
      //   beforeUpdate: async (menu) => {
      //     if (menu.parent_id && menu.changed('parent_id')) {
      //       const parent = await Menu.findByPk(menu.parent_id);
      //       if (!parent) {
      //         throw new Error('父级菜单不存在');
      //       }
      //     }
      //   }
    }
  });

  // 添加实例方法
  Menus.prototype.formatRoutes = function () {
    const menu = this.get({ plain: true });
    const { id, parent_id: parentId, lazy, path, index, name, icon, translation_key: translationKey, ns, roles, title, keywords, description, hide_child_in_menu: hideChildrenInMenu, hide_in_menu: hideInMenu, hide_title: hideTitle, permission, layout, is_link } = menu;

    const frontendMenu = {
      id, parentId, lazy, path,
      index: !!index, // 转换成布尔值
      handle: {
        name, icon,
        translationKey, ns, roles,
        hideChildrenInMenu: !!hideChildrenInMenu,
        hideInMenu: !!hideInMenu,
        hideTitle: !!hideTitle,
        permission,
        layout,
        target: is_link ? '_blank' : '_self',
        meta: {
          title, keywords, description
        },
      },
    };

    if (this.children && this.children.length > 0) {
      frontendMenu.children = this.children
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(item => {
          return item.formatRoutes()
        });
    }
    return frontendMenu;
  };

  // 检查菜单是否可访问
  Menus.prototype.isAccessible = function () {
    return this.status === 1 && this.hide_in_menu;
  };

  // 启用菜单
  Menus.prototype.enable = async function () {
    return await this.update({ status: 1 });
  };

  // 禁用菜单
  Menus.prototype.disable = async function () {
    return await this.update({ status: 0 });
  };

  // 定义自关联关系
  Menus.hasMany(Menus, {
    as: 'children',           // 子节点别名
    foreignKey: 'parent_id',  // 外键字段
  });

  Menus.belongsTo(Menus, {
    as: 'parent',            // 父节点别名
    foreignKey: 'parent_id', // 外键字段
    targetKey: 'id'
  });

  return Menus;
}
