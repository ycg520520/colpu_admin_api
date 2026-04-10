/**
 * @Author: colpu
 * @Date: 2026-03-27 12:33:56
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-03-30 12:12:01
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */

import { Umzug, SequelizeStorage } from 'umzug';
import { sysDb } from '../src/models/sys/index.js';
import { cmsDb } from '../src/models/cms/index.js';
import { aiDb } from '../src/models/ai/index.js';
import records from './migrations/ai/records.js';

const dbMap = {
  sys: sysDb,
  cms: cmsDb,
  ai: aiDb,
};
const umzug = new Umzug({
  migrations: [records],
  context: aiDb.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: aiDb }),
});
await umzug.up();
