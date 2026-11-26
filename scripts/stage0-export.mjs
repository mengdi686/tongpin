#!/usr/bin/env node
// 阶段0 数据导出（敏感：含手机号，禁止提交 git）
// 服务器无 sqlite3 CLI，改用 python3 标准库；本脚本需在服务器上运行。
// 用法：node scripts/stage0-export.mjs [输出路径]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = process.argv[2] || './stage0-export.csv';
const db = process.env.TP_DATA_DIR
  ? path.join(process.env.TP_DATA_DIR, 'stage0.db')
  : '/srv/tongpin-data/stage0.db';
if (!fs.existsSync(db)) {
  console.error('数据库不存在（本脚本需在服务器上运行）:', db);
  process.exit(1);
}
const q = `SELECT r.phone, r.created_at, r.linked_at, p.resonance, p.styles, p.care_top, p.animal
FROM reservations r LEFT JOIN profiles p ON p.vid = r.vid ORDER BY r.created_at DESC;`;
const py = [
  'import csv,sqlite3,sys',
  'con=sqlite3.connect(sys.argv[1]); con.row_factory=sqlite3.Row',
  'rows=con.execute(sys.argv[2]).fetchall()',
  'w=csv.writer(sys.stdout)',
  'if rows:',
  '    w.writerow(rows[0].keys())',
  '    [w.writerow(list(r)) for r in rows]',
].join('\n');
const csv = execFileSync('python3', ['-c', py, db, q], { encoding: 'utf8' });
fs.writeFileSync(out, '\uFEFF' + csv);
const lines = csv.trim() ? csv.trim().split('\n').length - 1 : 0;
console.log(`已导出 ${lines} 条预约到 ${path.resolve(out)}（含手机号，请妥善保管，勿提交 git）`);
