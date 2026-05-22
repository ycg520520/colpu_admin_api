/**
 * 重置后台内置账号密码（走 User 模型 beforeUpdate，自动 bcrypt）
 * 用法：node scripts/create/reset-admin-passwords.js
 */
import { users } from "../../src/models/sys/index.js";

const PASSWORD = "ycg19800124";
const USERNAMES = ["superadmin", "admin", "manager", "editor", "user"];

for (const username of USERNAMES) {
  const row = await users.findOne({ where: { username } });
  if (!row) {
    console.warn(`未找到用户: ${username}`);
    continue;
  }
  await row.update({ password: PASSWORD });
  console.log(`已重置密码: ${username}`);
}

console.log("后台内置账号密码重置完成。");
