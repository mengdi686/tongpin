#!/usr/bin/env node
// 阶段0 数据导出（敏感：含手机号，禁止提交 git）
// 用法：node scripts/stage0-export.mjs [输出路径]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = process.argv[2] || './stage0-export.csv';
const db = '/srv/tongpin-data/stage0.db';
if (!fs.existsSync(db)) {
  console.error('数据库不存在（本脚本需在服务器上运行）:', db);
  process.exit(1);
}
const q = `SELECT r.phone, r.created_at, r.linked_at, p.resonance, p.styles, p.care_top, p.animal
FROM reservations r LEFT JOIN profiles p ON p.vid = r.vid ORDER BY r.created_at DESC;`;
const csv = execFileSync('sqlite3', ['-header', '-csv', db, q], { encoding: 'utf8' });
fs.writeFileSync(out, '\uFEFF' + csv);
console.log(`已导出 ${csv.split('\n').length - 2} 条预约到 ${path.resolve(out)}（含手机号，请妥善保管）`);
