// 阶段1 提审就绪检查：一键核对代码/材料/配置是否齐备。
// 纯本地静态检查（不联网、不依赖微信工具）；线上可达性单独用 curl 验证。
// 用法：node scripts/stage1-readiness.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mp = path.join(root, 'miniprogram');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' → ' + detail : ''}`); }
}

console.log('同频 · 阶段1 提审就绪检查');

// 1. 代码与页面
console.log('\n[代码与页面]');
const app = JSON.parse(read('miniprogram/app.json'));
const requiredPages = ['pages/index/index', 'pages/birth/birth', 'pages/quiz/quiz', 'pages/result/result', 'pages/legal/legal'];
for (const p of requiredPages) {
  const inApp = app.pages.includes(p);
  const trio = ['.js', '.wxml', '.wxss', '.json'].every(ext => exists(`miniprogram/${p}${ext}`));
  check(`页面 ${p}`, inApp && trio, inApp ? '三件套不全' : '未注册');
}
check('AppID 已配置', /"appid"\s*:\s*"wx[0-9a-f]{16}"/.test(read('miniprogram/project.config.json')));
check('域名校验开启(提审态)', /"urlCheck"\s*:\s*true/.test(read('miniprogram/project.config.json')),
  'project.config.json 的 urlCheck 应为 true，调试用的 private 配置不算');

// 2. 合规材料
console.log('\n[合规材料]');
for (const f of ['docs/privacy-policy.md', 'docs/terms-of-service.md', 'docs/12-submission-inventory.md',
                 'docs/15-stage1-ondevice-checklist.md', 'docs/16-stage1-submission-form.md',
                 'apps/stage0-h5/legal/privacy.html', 'apps/stage0-h5/legal/terms.html']) {
  check(`材料 ${path.basename(f)}`, exists(f));
}
check('公开合规页 URL 在提审稿中', read('docs/16-stage1-submission-form.md').includes('https://stage0.tongpin.truthhare.com/legal/privacy.html'));
check('联系邮箱已替换', read('docs/privacy-policy.md').includes('mateotao@163.com') && !read('docs/privacy-policy.md').includes('【待填】'));

// 3. 小程序内权利入口
console.log('\n[小程序内权利入口]');
const idxW = read('miniprogram/pages/index/index.wxml');
const resW = read('miniprogram/pages/result/result.wxml');
const resJ = read('miniprogram/pages/result/result.js');
check('首页有隐私政策/协议入口', idxW.includes('onLegal') && idxW.includes('privacy') && idxW.includes('terms'));
check('结果页有政策入口', resW.includes('onLegal'));
check('结果页有删除数据入口', resW.includes('onDeleteData') && resJ.includes('deleteAll'));
check('生日页有单独同意', read('miniprogram/pages/birth/birth.wxml').includes('同意') || read('miniprogram/pages/birth/birth.js').includes('consent'));

// 4. 动物图链路（曾出 bug 的地方，重点查）
console.log('\n[动物图链路]');
const copy = read('miniprogram/config/copy.js');
check('pickAnimal 带 file 字段', /file:\s*ANIMALS\[id\]\.file/.test(copy), '曾漏传 file 导致图不显示');
const animalFiles = [...copy.matchAll(/file:\s*'([^']+\.png)'/g)].map(m => m[1]);
check('动物配置 ≥8 个 PNG', animalFiles.length >= 8, `实际 ${animalFiles.length}`);
const missingImgs = animalFiles.filter(f => !exists(`miniprogram/assets/animals/${f}`));
check('动物 PNG 文件齐全', missingImgs.length === 0, missingImgs.join(','));
const imgs = fs.readdirSync(path.join(mp, 'assets/animals')).filter(f => f.endsWith('.png'));
const totalBytes = imgs.reduce((s, f) => s + fs.statSync(path.join(mp, 'assets/animals', f)).size, 0);
check('图片资源 < 200K', totalBytes < 200 * 1024, `${(totalBytes / 1024).toFixed(1)}KB`);

// 5. 计分与合规
console.log('\n[计分与合规]');
const breeze = read('miniprogram/pages/result/result.wxml');
check('结果页有免责声明', breeze.includes('disclaimer'));
check('无 web-view(个人主体不支持)', !fs.readdirSync(path.join(mp, 'pages')).some(d => exists(`miniprogram/pages/${d}/webview.wxml`)));

console.log(`\n结果：${pass} PASS / ${fail} FAIL`);
if (fail) {
  console.log('存在未就绪项，修完再提审。');
  process.exit(1);
}
console.log('阶段1 提审就绪：代码/材料/配置齐备。剩余为用户操作（上传代码、提审表单、隐私保护指引勾选）。');
