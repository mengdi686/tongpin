/* 缘趣 · 兴趣测评交友 PWA 原型
   全部数据保存在浏览器 localStorage，不联网、不上传。
   正式版需要：服务端账号体系、真实支付、图片/语音存储、内容审核。 */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const TAGS = ['旅行', '音乐', '电影', '运动', '美食', '宠物', '游戏', '阅读', '摄影', '手作', '户外', '咖啡'];

/* 离线性艺术头像：不依赖外网，任何环境都能显示 */
const PALETTES = [
  ['#ff9a9e', '#fad0c4'], ['#a18cd1', '#fbc2eb'], ['#ffecd2', '#fcb69f'],
  ['#84fab0', '#8fd3f4'], ['#a1c4fd', '#c2e9fb'], ['#f6d365', '#fda085'],
  ['#fbc2eb', '#a6c1ee'], ['#fddb92', '#d1fdff'], ['#e0c3fc', '#8ec5fc'],
  ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'], ['#43e97b', '#38f9d7']
];

function photoFor(c) {
  const i = Math.max(0, SEED.findIndex(x => x.id === c.id));
  const [a, b] = PALETTES[i % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <radialGradient id="r" cx="46%" cy="34%" r="62%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="600" height="760" fill="url(#g)"/>
    <circle cx="492" cy="130" r="220" fill="#ffffff" opacity=".17"/>
    <circle cx="78" cy="628" r="270" fill="#000000" opacity=".10"/>
    <circle cx="352" cy="452" r="128" fill="#ffffff" opacity=".12"/>
    <ellipse cx="300" cy="330" rx="210" ry="230" fill="url(#r)"/>
    <path d="M0 604 Q 150 520 300 596 T 600 552 L600 760 L0 760 Z" fill="#ffffff" opacity=".10"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function avatarFor(c) {
  const i = Math.max(0, SEED.findIndex(x => x.id === c.id));
  const [a, b] = PALETTES[i % PALETTES.length];
  const initial = (c.name || '?').slice(0, 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <circle cx="520" cy="96" r="180" fill="#ffffff" opacity=".18"/>
    <circle cx="64" cy="556" r="190" fill="#000000" opacity=".10"/>
    <text x="300" y="392" text-anchor="middle" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="240" font-weight="600" fill="#ffffff" opacity=".95">${initial}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* 认知维度标签：回答“怎么想、怎么处理关系”，不是兴趣 */
const COG_TAGS = ['长期主义', '体验优先', '稳定优先', '成长导向', '表达直接', '慢热', '独立', '关系优先', '计划型', '即兴型'];

/* 24 题量表：eHarmony 精简 12 + IPIP 大五 8 + ECR-R 依恋 4
   5 点李克特（1 完全不像 → 5 非常像我）；rev 表示反向计分 */
const SCALE_OPTS = ['完全不像', '不太像', '一半一半', '比较像', '非常像我'];

const SCALE = [
  { m: 'eh', dim: '长期目标一致性', cog: ['长期主义', '计划型'], q: '我对未来五年有比较清楚的打算' },
  { m: 'eh', dim: '承诺意愿', cog: ['长期主义', '关系优先'], q: '一旦确定关系，我愿意为它放弃一部分自由' },
  { m: 'eh', dim: '家庭观', cog: ['关系优先', '稳定优先'], q: '结婚以后，家庭应该比事业占更大比重' },
  { m: 'eh', dim: '亲和力', cog: ['表达直接', '关系优先'], q: '陌生人通常很快就能和我聊起来' },
  { m: 'eh', dim: '休闲方式', cog: ['关系优先', '体验优先'], q: '周末我更想和伴侣一起出门，而不是各玩各的' },
  { m: 'eh', dim: '沟通方式', cog: ['表达直接', '成长导向'], q: '有不舒服我会当天说出来，不让它过夜' },
  { m: 'eh', dim: '情绪稳定性', cog: ['稳定优先', '慢热'], q: '我很少因为小事情绪大起大落' },
  { m: 'eh', dim: '独立性', cog: ['独立'], q: '我需要一段完全属于自己、不被打扰的时间' },
  { m: 'eh', dim: '金钱观', cog: ['体验优先', '即兴型'], q: '钱更应该花在体验上，而不是攒着' },
  { m: 'eh', dim: '冲突处理', cog: ['慢热', '稳定优先'], q: '吵架时我会先停一下，等冷静了再谈' },
  { m: 'eh', dim: '依恋安全', cog: ['稳定优先', '独立'], rev: true, q: '对方晚回消息，我会反复想是不是自己说错了话' },
  { m: 'eh', dim: '嫉妒倾向', cog: ['独立', '慢热'], rev: true, q: '我会很在意对方和异性朋友的往来' },
  { m: 'bf', dim: 'O', cog: ['体验优先', '即兴型'], q: '我喜欢尝试没做过的事' },
  { m: 'bf', dim: 'O', cog: ['体验优先', '成长导向'], q: '展览、演出、电影这类东西能让我待很久' },
  { m: 'bf', dim: 'C', cog: ['计划型', '长期主义'], q: '我做事习惯提前规划好' },
  { m: 'bf', dim: 'C', cog: ['长期主义', '稳定优先'], q: '我答应的事，基本都会做到' },
  { m: 'bf', dim: 'E', cog: ['表达直接', '关系优先'], q: '在陌生场合，我也能主动开口' },
  { m: 'bf', dim: 'A', cog: ['慢热', '关系优先'], q: '我很少和别人起冲突，更愿意退一步' },
  { m: 'bf', dim: 'S', cog: ['慢热'], rev: true, q: '我经常感到焦虑' },
  { m: 'bf', dim: 'S', cog: ['成长导向', '慢热'], rev: true, q: '我常担心自己做得不够好' },
  { m: 'ecr', dim: 'anx', q: '我会担心对方其实没有我以为的那样喜欢我' },
  { m: 'ecr', dim: 'anx', q: '对方回应得慢，我就会不安' },
  { m: 'ecr', dim: 'avo', q: '我不太习惯向别人袒露自己的脆弱' },
  { m: 'ecr', dim: 'avo', q: '关系变得太近的时候，我会想往后退一点' }
];

/* 照片偏好题库：离线 SVG 人像，按发型 / 脸型 / 气质区分 */
const FACE_POOL = [
  { id: 'p1', hair: '短发', face: '鹅蛋脸', vibe: '温柔', pal: ['#ffd7c4', '#f7a58c', '#5a4038'] },
  { id: 'p2', hair: '长发', face: '清秀', vibe: '文艺', pal: ['#ffe3d1', '#f3b39c', '#3f2f2a'] },
  { id: 'p3', hair: '中长', face: '立体', vibe: '干练', pal: ['#f6d6c2', '#e6a27f', '#33261f'] },
  { id: 'p4', hair: '短发', face: '圆脸', vibe: '阳光', pal: ['#ffdcc8', '#f2ab8d', '#5a3b28'] },
  { id: 'p5', hair: '丸子头', face: '鹅蛋脸', vibe: '温柔', pal: ['#ffe6d5', '#f5b79e', '#4a332c'] },
  { id: 'p6', hair: '长发', face: '立体', vibe: '清冷', pal: ['#f7dfd0', '#dfae91', '#2f2622'] },
  { id: 'p7', hair: '短发', face: '清秀', vibe: '文艺', pal: ['#ffe0cb', '#efb092', '#463028'] },
  { id: 'p8', hair: '中长', face: '圆脸', vibe: '阳光', pal: ['#ffddc6', '#f4a987', '#573a2a'] },
  { id: 'p9', hair: '丸子头', face: '立体', vibe: '干练', pal: ['#f8dcc7', '#e8a888', '#3a2a24'] },
  { id: 'p10', hair: '长发', face: '鹅蛋脸', vibe: '温柔', pal: ['#ffe7d9', '#f2b299', '#4c332c'] },
  { id: 'p11', hair: '短发', face: '立体', vibe: '清冷', pal: ['#f3ddce', '#dcab8c', '#2c2320'] },
  { id: 'p12', hair: '中长', face: '鹅蛋脸', vibe: '文艺', pal: ['#ffe4cf', '#f0b395', '#473029'] },
  { id: 'p13', hair: '长发', face: '圆脸', vibe: '温柔', pal: ['#ffe9db', '#f6b9a1', '#4f352d'] },
  { id: 'p14', hair: '短发', face: '圆脸', vibe: '阳光', pal: ['#ffdac2', '#f0a585', '#5c3c28'] },
  { id: 'p15', hair: '丸子头', face: '清秀', vibe: '文艺', pal: ['#ffe2cf', '#eeaf92', '#44302a'] },
  { id: 'p16', hair: '中长', face: '清秀', vibe: '温柔', pal: ['#ffe5d4', '#f3b59b', '#4a322b'] },
  { id: 'p17', hair: '短发', face: '鹅蛋脸', vibe: '干练', pal: ['#f8dccb', '#e3a284', '#362822'] },
  { id: 'p18', hair: '长发', face: '鹅蛋脸', vibe: '清冷', pal: ['#f5e0d2', '#dcae91', '#2e2521'] },
  { id: 'p19', hair: '中长', face: '立体', vibe: '温柔', pal: ['#f9dfcf', '#e8ae90', '#3c2b25'] },
  { id: 'p20', hair: '丸子头', face: '圆脸', vibe: '文艺', pal: ['#ffe4d2', '#f1b298', '#48312a'] }
];

/* 候选人的人脸特征（用于算“眼缘”） */
const FACE = {
  c1: { hair: '短发', face: '鹅蛋脸', vibe: '温柔' },
  c2: { hair: '中长', face: '立体', vibe: '干练' },
  c3: { hair: '长发', face: '清秀', vibe: '文艺' },
  c4: { hair: '短发', face: '立体', vibe: '阳光' },
  c5: { hair: '丸子头', face: '鹅蛋脸', vibe: '温柔' },
  c6: { hair: '短发', face: '圆脸', vibe: '文艺' },
  c7: { hair: '长发', face: '圆脸', vibe: '温柔' },
  c8: { hair: '短发', face: '立体', vibe: '阳光' },
  c9: { hair: '中长', face: '清秀', vibe: '清冷' },
  c10: { hair: '长发', face: '鹅蛋脸', vibe: '文艺' },
  c11: { hair: '中长', face: '圆脸', vibe: '温柔' },
  c12: { hair: '短发', face: '圆脸', vibe: '阳光' }
};

/* 人脸头像：离线 SVG，不依赖外网 */
function facePhoto(p) {
  const [skin, shade, hair] = p.pal;
  const hairShape = {
    短发: `<path d="M150 250c-6-86 52-140 150-140s156 54 150 140c-2 28-10 8-14-8-8-30-30-46-66-52-40-6-80 6-112 30-18 12-30 30-34 48-4 16-10 14-12-18z" fill="${hair}"/>`,
    中长: `<path d="M148 258c-8-94 56-150 152-150s160 56 152 150c0 34-16 26-18-6-6-44-24-66-58-76-44-12-96 2-134 34-30 24-42 48-44 70-2 22-16 24-18-22z" fill="${hair}"/><path d="M150 240c-18 60-22 120-10 172 4 20 26 20 28 0 4-52 10-104 22-152z" fill="${hair}"/><path d="M450 240c18 60 22 120 10 172-4 20-26 20-28 0-4-52-10-104-22-152z" fill="${hair}"/>`,
    丸子头: `<circle cx="300" cy="86" r="46" fill="${hair}"/><path d="M152 252c-6-88 54-142 148-142s154 54 148 142c-2 26-12 6-14-10-8-30-28-46-64-52-40-6-80 6-112 30-16 12-28 30-32 48-4 16-10 14-12 18z" fill="${hair}"/>`,
    长发: `<path d="M146 264c-8-98 58-154 154-154s158 56 152 154c0 40-18 30-20-2-6-46-26-68-60-78-44-12-96 2-134 34-30 24-42 50-44 72-2 22-16 24-18-26z" fill="${hair}"/><path d="M146 250c-22 66-26 132-12 190 6 22 30 20 32-2 4-58 10-112 22-162z" fill="${hair}"/><path d="M454 250c22 66 26 132 12 190-6 22-30 20-32-2-4-58-10-112-22-162z" fill="${hair}"/>`
  }[p.hair] || '';
  const facePath = {
    鹅蛋脸: 'M300 150c66 0 108 46 108 108s-46 120-108 120-108-58-108-120 42-108 108-108z',
    圆脸: 'M300 152c74 0 116 52 116 116 0 72-52 116-116 116s-116-44-116-116c0-64 42-116 116-116z',
    清秀: 'M300 148c62 0 100 44 100 106 0 74-42 128-100 128s-100-54-100-128c0-62 38-106 100-106z',
    立体: 'M300 146c70 0 112 44 112 104 0 70-32 118-78 136l-34 12-34-12c-46-18-78-66-78-136 0-60 42-104 112-104z'
  }[p.face] || '';
  const mouth = p.vibe === '清冷' ? 'M270 348q30 -8 60 0' : 'M268 342q32 20 64 0';
  const eyes = p.vibe === '干练'
    ? '<path d="M248 288h40M312 288h40" stroke="#3a2b25" stroke-width="6" stroke-linecap="round"/>'
    : '<ellipse cx="266" cy="288" rx="9" ry="11" fill="#3a2b25"/><ellipse cx="334" cy="288" rx="9" ry="11" fill="#3a2b25"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade}" stop-opacity=".28"/><stop offset="1" stop-color="${hair}" stop-opacity=".14"/></linearGradient>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skin}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs>
    <rect width="600" height="600" fill="#fdf3ec"/><rect width="600" height="600" fill="url(#bg)"/>
    <path d="M96 600c18-118 100-176 204-176s186 58 204 176z" fill="${shade}" opacity=".9"/>
    ${facePath ? `<path d="${facePath}" fill="url(#sk)"/>` : ''}
    ${hairShape}
    ${eyes}
    <path d="${mouth}" stroke="#b5624f" stroke-width="6" stroke-linecap="round" fill="none"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* 8 道 A/B 两难题：测取舍，不测自我评价；认知 5 题 + 兴趣 3 题 */
/* 旧的 8 题 A/B 已由上面的 24 题量表替代 */

/* 每个候选人的认知画像（3 个标签，第一个权重最高） */
const COG = {
  c1: ['体验优先', '慢热', '长期主义'], c2: ['成长导向', '计划型', '独立'],
  c3: ['表达直接', '即兴型', '关系优先'], c4: ['独立', '体验优先', '长期主义'],
  c5: ['慢热', '成长导向', '独立'], c6: ['慢热', '即兴型', '独立'],
  c7: ['关系优先', '表达直接', '体验优先'], c8: ['计划型', '独立', '稳定优先'],
  c9: ['慢热', '体验优先', '独立'], c10: ['表达直接', '体验优先', '关系优先'],
  c11: ['关系优先', '慢热', '成长导向'], c12: ['稳定优先', '计划型', '关系优先']
};

/* 牵手风格的真实资料卡（身高/学历/职业/收入/恋爱观） */
const PROFILE = {
  c1: { h: '162', edu: '本科', job: '平面设计', income: '15-25万', loveView: '慢慢来，先做朋友' },
  c2: { h: '178', edu: '硕士', job: '产品经理', income: '30-50万', loveView: '奔着结婚去' },
  c3: { h: '165', edu: '本科', job: '音乐老师', income: '10-20万', loveView: '看感觉，不设限' },
  c4: { h: '182', edu: '本科', job: '自由摄影师', income: '20-40万', loveView: '一起看世界' },
  c5: { h: '160', edu: '硕士', job: '咖啡师', income: '10-15万', loveView: '平淡是真' },
  c6: { h: '176', edu: '本科', job: '程序员', income: '30-50万', loveView: '先聊得来再说' },
  c7: { h: '158', edu: '本科', job: '烘焙师', income: '10-20万', loveView: '想被宠着' },
  c8: { h: '180', edu: '硕士', job: '建筑师', income: '25-40万', loveView: '互相成就' },
  c9: { h: '175', edu: '本科', job: '户外领队', income: '15-25万', loveView: '一起野' },
  c10:{ h: '168', edu: '硕士', job: '医生', income: '30-50万', loveView: '稳定踏实' },
  c11:{ h: '163', edu: '本科', job: '花店老板', income: '15-25万', loveView: '浪漫主义' },
  c12:{ h: '175', edu: '本科', job: '公务员', income: '15-25万', loveView: '过日子型' }
};

const SEED = [
  { id: 'c1', name: '小满', age: 24, city: '上海', dist: '2.1km', verified: true, likesYou: true,
    tags: ['旅行', '咖啡', '摄影'],
    bio: '周末在弄堂里找咖啡馆，拍完照就去赶火车。想去的地方还有 37 个。',
    prompt: 'natural candid portrait of a 24 year old chinese woman with short bob hair, smiling gently, sitting in a sunlit cafe by the window, warm film tones, shallow depth of field, smartphone photo style' },
  { id: 'c2', name: '阿哲', age: 27, city: '上海', dist: '3.4km', verified: true, likesYou: false,
    tags: ['运动', '户外', '宠物'],
    bio: '早上跑步，周末攀岩，家里有只金毛。安静的时候会看书。',
    prompt: 'natural portrait of a 27 year old chinese man in a grey hoodie, holding a golden retriever, outdoor park background, soft afternoon light, candid smartphone photo' },
  { id: 'c3', name: '可可', age: 25, city: '上海', dist: '0.8km', verified: true, likesYou: true,
    tags: ['音乐', '电影', '美食'],
    bio: 'live house 常客，会弹贝斯的厨子。深夜会突然想吃火锅。',
    prompt: 'natural portrait of a 25 year old chinese woman with long wavy hair, laughing, at a live music venue with warm stage lights bokeh, candid smartphone photo' },
  { id: 'c4', name: '江野', age: 29, city: '杭州', dist: '120km', verified: false, likesYou: false,
    tags: ['户外', '旅行', '摄影'],
    bio: '一年两次长线徒步，其余时间在修图。喜欢山顶的风。',
    prompt: 'natural portrait of a 29 year old chinese man with a backpack, standing on a mountain trail at golden hour, wearing a cap, candid outdoor smartphone photo' },
  { id: 'c5', name: '温雨', age: 23, city: '上海', dist: '5.2km', verified: true, likesYou: false,
    tags: ['阅读', '咖啡', '手作'],
    bio: '咖啡师，休息日做陶。喜欢纸质书翻页的声音。',
    prompt: 'natural portrait of a 23 year old chinese woman with a low bun, wearing an apron, making pottery in a bright studio, soft daylight, candid smartphone photo' },
  { id: 'c6', name: '陆一', age: 26, city: '上海', dist: '1.6km', verified: false, likesYou: false,
    tags: ['游戏', '电影', '音乐'],
    bio: '主机玩家，片单 400+。可以陪你连麦到凌晨两点。',
    prompt: 'natural portrait of a 26 year old chinese man with glasses, sitting in a cozy room with game posters, warm lamp light, candid smartphone photo' },
  { id: 'c7', name: '果果', age: 22, city: '上海', dist: '4.5km', verified: true, likesYou: false,
    tags: ['宠物', '美食', '手作'],
    bio: '养了两只猫，烘焙翻车现场专家。猫比我上镜。',
    prompt: 'natural portrait of a 22 year old chinese woman holding two cats, in a warm home kitchen, candid lifestyle smartphone photo' },
  { id: 'c8', name: '阿岩', age: 30, city: '苏州', dist: '80km', verified: false, likesYou: false,
    tags: ['运动', '游戏', '户外'],
    bio: '周末爬石头，工作日打游戏。体力还行，话不多。',
    prompt: 'natural portrait of a 30 year old chinese man with short hair, bouldering gym background, chalk on hands, candid smartphone photo' },
  { id: 'c9', name: '星野', age: 28, city: '上海', dist: '7.0km', verified: true, likesYou: false,
    tags: ['摄影', '旅行', '阅读'],
    bio: '胶片相机和旧书店。拍人不喜欢让人看镜头。',
    prompt: 'natural portrait of a 28 year old chinese woman with a film camera around her neck, standing in a vintage bookstore, soft window light, candid smartphone photo' },
  { id: 'c10', name: '想想', age: 25, city: '上海', dist: '2.8km', verified: false, likesYou: false,
    tags: ['电影', '音乐', '咖啡'],
    bio: '影迷，会点手冲。可以聊三个小时的导演。',
    prompt: 'natural portrait of a 25 year old chinese woman with shoulder length hair, holding a coffee cup, in an art house cinema lobby, warm light, candid smartphone photo' },
  { id: 'c11', name: '阿柚', age: 24, city: '上海', dist: '1.2km', verified: true, likesYou: true,
    tags: ['手作', '宠物', '美食'],
    bio: '做皮具，养柯基。给朋友做礼物是我的快乐来源。',
    prompt: 'natural portrait of a 24 year old chinese woman with braided hair, holding a corgi, in a leather craft workshop, warm daylight, candid smartphone photo' },
  { id: 'c12', name: '老陈', age: 31, city: '上海', dist: '6.0km', verified: false, likesYou: false,
    tags: ['美食', '咖啡', '运动'],
    bio: '厨子，下班去健身房。会做一手好菜，也会洗碗。',
    prompt: 'natural portrait of a 31 year old chinese man in a chef apron, in a bright kitchen, smiling, candid smartphone photo' }
];

const LS = {
  get(k, d) { try { const v = localStorage.getItem('yq_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('yq_' + k, JSON.stringify(v)); } catch (e) { toast('本机存储空间不足'); } }
};

const S = {
  user: LS.get('user', null),
  likes: LS.get('likes', []),
  passes: LS.get('passes', []),
  matches: LS.get('matches', []),
  msgs: LS.get('msgs', {}),
  member: LS.get('member', 0),
  daily: LS.get('daily', { day: '', n: 0 })
};

const draft = { name: '', age: '', city: '', gender: '', avatar: null, tags: [], answers: [], vec: null, score: 0 };
let obStepIdx = 0, quizIdx = 0, currentChat = null, toastTimer = null;

/* ---------- 工具 ---------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

const isMember = () => S.member && S.member > Date.now();

const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function todayUsed() {
  if (S.daily.day !== todayKey()) { S.daily = { day: todayKey(), n: 0 }; }
  return S.daily.n;
}
const FREE_LIKES = 5;

function vecOfTags(tags) {
  const v = {};
  tags.forEach((t, i) => { v[t] = i === 0 ? 3 : 2; });
  return v;
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const keys = Object.keys(a || {}).concat(Object.keys(b || {}));
  keys.forEach(t => {
    const x = (a && a[t]) || 0, y = (b && b[t]) || 0;
    dot += x * y; na += x * x; nb += y * y;
  });
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
/* 三个模型的分：eHarmony 12 维 / 大五 / ECR-R（1-7） */
function scaleScores(ans) {
  const val = i => (ans[i] == null ? 3 : ans[i] + 1);
  const v = i => (SCALE[i].rev ? 6 - val(i) : val(i));
  const eh = {}, bfAgg = {}, ecrAgg = {};
  SCALE.forEach((it, i) => {
    const s = v(i);
    if (it.m === 'eh') eh[it.dim] = Math.round((s - 1) / 4 * 100);
    if (it.m === 'bf') { bfAgg[it.dim] = bfAgg[it.dim] || []; bfAgg[it.dim].push(s); }
    if (it.m === 'ecr') { ecrAgg[it.dim] = ecrAgg[it.dim] || []; ecrAgg[it.dim].push(s); }
  });
  const bf = {};
  ['O', 'C', 'E', 'A', 'S'].forEach(k => {
    const arr = bfAgg[k] || [3];
    bf[k] = Math.round((arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 4 * 100);
  });
  const avg = arr => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 3);
  const ecr = {
    anx: Math.round(((avg(ecrAgg.anx) - 1) / 4 * 6 + 1) * 10) / 10,
    avo: Math.round(((avg(ecrAgg.avo) - 1) / 4 * 6 + 1) * 10) / 10
  };
  return { eh, bf, ecr };
}

function attachLabel(ecr) {
  if (ecr.anx >= 4.5 && ecr.avo >= 4.5) return '恐惧型（既怕被弃也怕靠近）';
  if (ecr.anx >= 4.5) return '焦虑型（怕被抛弃）';
  if (ecr.avo >= 4.5) return '疏离型（怕被吞没）';
  if (ecr.anx <= 3 && ecr.avo <= 3) return '安全型';
  return '偏安全，轻度焦虑';
}

/* 把专业分数翻成用户能直接读懂的话（不暴露量表名称和原始分） */
const ECR_PLAIN = {
  '恐惧型（既怕被弃也怕靠近）': { name: '又近又怕型', line: '你既想靠近，又怕受伤；对方一冷，你会先想撤。', tip: '慢一点开始，先把稳定感建立起来。' },
  '焦虑型（怕被抛弃）': { name: '需要回应型', line: '你很在意对方的回应，回得慢会让你不安。', tip: '适合愿意及时回你消息的人。' },
  '疏离型（怕被吞没）': { name: '需要空间型', line: '关系太近时你会想退一步，需要自己的空间。', tip: '适合节奏慢、不追不逼的人。' },
  '安全型': { name: '安心型', line: '你在关系里比较稳，敢靠近，也能一个人待着。', tip: '和同样稳的人在一起，你会更放松。' },
  '偏安全，轻度焦虑': { name: '偏安心型', line: '多数时候你挺稳，偶尔也需要一句确认。', tip: '对方回得慢时，先别急着往坏处想。' }
};
const BF_PLAIN = { O: '好奇心', C: '靠谱度', E: '外放度', A: '好相处', S: '情绪平稳' };
function ecrPlain(ecr) { return ECR_PLAIN[attachLabel(ecr)] || ECR_PLAIN['偏安全，轻度焦虑']; }
function bfLevel(v) { return v >= 70 ? '偏高' : v >= 46 ? '中等' : '偏低'; }
function topBf(bf, n) {
  return Object.keys(BF_PLAIN).map(k => ({ name: BF_PLAIN[k], v: bf[k] || 0 }))
    .sort((a, b) => b.v - a.v).slice(0, n || 3);
}
function topEh(eh, n) { return Object.entries(eh).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, n || 3); }
function lowEh(eh, n) { return Object.entries(eh).sort((a, b) => a[1] - b[1]).map(e => e[0]).slice(0, n || 2); }

/* 眼缘：照片选择得到的偏好权重 × 候选人的脸型特征 */
function buildFaceW(picks, avoids) {
  const w = {};
  const bump = (p, d) => {
    ['hair', 'face', 'vibe'].forEach(k => { w[k + ':' + p[k]] = (w[k + ':' + p[k]] || 0) + d; });
  };
  picks.forEach(p => bump(p, 1));
  avoids.forEach(p => bump(p, -2));
  return w;
}

function faceScore(c) {
  const w = S.user && S.user.faceW;
  const f = FACE[c.id];
  if (!w || !f) return 62;
  let v = 0;
  ['hair', 'face', 'vibe'].forEach(k => { v += w[k + ':' + f[k]] || 0; });
  return Math.max(28, Math.min(99, Math.round(62 + v * 6)));
}

/* 认知、兴趣、眼缘分开算，不合成一个虚高的总分 */
function scoresOf(c) {
  const cog = Math.min(99, Math.round(55 + 44 * cosine(S.user && S.user.cogW, vecOfTags(COG[c.id] || []))));
  const int = Math.min(99, Math.round(55 + 44 * cosine(S.user && S.user.w, vecOfTags(c.tags))));
  const face = faceScore(c);
  return { cog, int, face, total: Math.round((cog + int + face) / 3) };
}

function fmtTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function compressImage(file, max = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/* ---------- 导航 ---------- */
function setTab(tab) {
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.id === 'screen-' + tab));
  $$('#tabbar button').forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
  $('#tabbar').style.display = tab === 'onboard' ? 'none' : 'flex';
  if (tab === 'matches') renderMatches();
  if (tab === 'me') renderMe();
}

/* ---------- 引导 ---------- */
function showObStep(n) {
  obStepIdx = n;
  $$('.ob-step').forEach(el => el.classList.toggle('is-active', +el.dataset.step === n));
  $('#obBar').style.width = (n / 5 * 100) + '%';
  $('#screen-onboard').scrollTop = 0;
}

function startOnboard(fromRetake) {
  if (!fromRetake) {
    draft.name = ''; draft.age = ''; draft.city = ''; draft.gender = ''; draft.avatar = null;
  } else {
    const u = S.user || {};
    draft.name = u.name || ''; draft.age = u.age || ''; draft.city = u.city || '';
    draft.gender = u.gender || ''; draft.avatar = u.avatar || null;
    draft.tags = [...(u.tags || [])];
    $('#obName').value = draft.name; $('#obAge').value = draft.age;
    $('#obCity').value = draft.city; $('#obAvatarPreview').innerHTML = '';
  }
  draft.answers = []; draft.vec = null; draft.score = 0;
  draft.facePicks = []; draft.faceAvoid = []; draft.faceRound = 0;
  quizIdx = 0;
  renderOnboardTags();
  $$('#obGender .chip').forEach(c => c.classList.toggle('is-on', c.dataset.v === draft.gender));
  setTab('onboard');
  showObStep(fromRetake ? 1 : 0);
}

function renderOnboardTags() {
  $('#obTags').innerHTML = TAGS.map(t => `<button class="chip ${draft.tags.includes(t) ? 'is-on' : ''}" data-t="${t}">${t}</button>`).join('');
  $('#tagCount').textContent = `已选 ${draft.tags.length} 个`;
}

function renderPortrait() {
  const hi = $('#portraitHi');
  if (hi) hi.textContent = `${draft.name || '你'}，这是现在的你`;
  $('#portraitTags').innerHTML = draft.tags.map(t => `<span class="ptag">${t}</span>`).join('');
  renderIdealPreview(draft.prefs);
  renderScaleSummary();
}

/* 画像页只讲用户关心的：在关系里的样子、性格底色、看重什么 */
function renderScaleSummary() {
  const box = $('#scaleSummary');
  if (!box) return;
  const sc = draft.scales;
  if (!sc) { box.innerHTML = ''; return; }
  const ep = ecrPlain(sc.ecr);
  const bf = topBf(sc.bf, 3);
  const eh = topEh(sc.eh, 3);
  box.innerHTML = `
    <div class="ins-card">
      <span class="ins-kicker">你在关系里的样子</span>
      <b>${ep.name}</b>
      <p>${ep.line}</p>
    </div>
    <div class="ins-card">
      <span class="ins-kicker">你的性格底色</span>
      <div class="ins-chips">${bf.map(x => `<span>${x.name} ${bfLevel(x.v)}</span>`).join('')}</div>
    </div>
    <div class="ins-card">
      <span class="ins-kicker">你更看重</span>
      <div class="ins-chips">${eh.map(k => `<span>${k}</span>`).join('')}</div>
    </div>`;
}

function buildProfile() {
  const iw = {};
  TAGS.forEach(t => { iw[t] = 0; });
  const cw = {};
  COG_TAGS.forEach(t => { cw[t] = 0; });
  draft.tags.forEach(t => { iw[t] += 3; });
  /* 认知向量来自量表：按答案强度累加到认知标签，保留正向基底 */
  SCALE.forEach((it, i) => {
    const val = draft.answers[i] == null ? 3 : draft.answers[i] + 1;
    const s = it.rev ? 6 - val : val;
    (it.cog || []).forEach(t => { cw[t] = (cw[t] || 0) + (s - 3) + 3; });
  });
  draft.vec = iw;
  draft.cogW = cw;
  draft.scales = scaleScores(draft.answers);
  draft.faceW = buildFaceW(draft.facePicks || [], draft.faceAvoid || []);
  if (!draft.prefs) draft.prefs = defaultPrefs();
  draft.score = Math.min(98, 60 + draft.tags.length * 6 + draft.answers.filter(a => a != null).length * 1.6 + 8);
}

/* ---------- 测评：24 题 5 点量表 ---------- */
function renderQuiz() {
  const q = SCALE[quizIdx];
  $('#quizDots').innerHTML = SCALE.map((_, i) => `<i class="${i <= quizIdx ? 'is-on' : ''}"></i>`).join('');
  $('#quizStepLabel').textContent = `第 ${quizIdx + 1} / ${SCALE.length} 题 · ${q.m === 'eh' ? '关系匹配' : q.m === 'bf' ? '大五人格' : '依恋风格'}`;
  $('#quizBody').innerHTML = `
    <p class="quiz-tag">这句像你吗？</p>
    <h2 class="quiz-q">${q.q}</h2>
    <div class="likert">${SCALE_OPTS.map((t, i) => `
      <button class="likert-btn ${draft.answers[quizIdx] === i ? 'is-on' : ''}" data-i="${i}">
        <i>${i + 1}</i><span>${t}</span>
      </button>`).join('')}</div>
    <p class="tiny muted center">没有对错，凭第一反应选</p>`;
}

/* ---------- 照片偏好「我的那个 ta」 ---------- */
const FACE_ROUNDS = 5;

function faceRoundCards() {
  if (draft.faceRound >= FACE_ROUNDS) {
    const picked = new Set(draft.facePicks.map(p => p.id));
    return FACE_POOL.filter(p => !picked.has(p.id)).slice(0, 4);
  }
  const start = draft.faceRound * 4;
  return FACE_POOL.slice(start, start + 4);
}

function renderFaceStep() {
  const inAvoid = draft.faceRound >= FACE_ROUNDS;
  const cards = faceRoundCards();
  const dots = $('#faceDots');
  if (dots) {
    dots.innerHTML = Array.from({ length: FACE_ROUNDS + 1 }, (_, i) =>
      `<i class="${i < draft.faceRound ? 'is-done' : i === draft.faceRound ? 'is-on' : ''}"></i>`).join('');
  }
  $('#faceHint').textContent = inAvoid
    ? '最后一步：这 4 张里，你不会考虑哪一张？'
    : '4 张里，选一张你最想认识的';
  const note = $('#faceNote');
  if (note) note.textContent = inAvoid
    ? '排除也是线索，我们会尽量不推荐这一类。'
    : '不看资料，也不看条件，凭第一感觉就好。';
  $('#faceStep').textContent = `第 ${Math.min(draft.faceRound + 1, FACE_ROUNDS + 1)} / ${FACE_ROUNDS + 1} 步`;
  $('#faceGrid').innerHTML = cards.map(p => `
    <button class="face-card ${inAvoid ? 'is-avoid' : ''}" data-face="${p.id}">
      <img src="${facePhoto(p)}" alt="" />
    </button>`).join('');
  $('#faceGrid').querySelectorAll('[data-face]').forEach(el => {
    el.onclick = () => {
      const p = FACE_POOL.find(x => x.id === el.dataset.face);
      if (!p) return;
      if (draft.faceRound >= FACE_ROUNDS) {
        draft.faceAvoid = [p];
        draft.faceW = buildFaceW(draft.facePicks, draft.faceAvoid);
        $('#faceGrid').querySelectorAll('[data-face]').forEach(b => { b.disabled = true; });
        buildProfile(); renderPortrait();
        setTimeout(() => showObStep(5), 260);
        return;
      }
      draft.facePicks.push(p);
      draft.faceRound++;
      renderFaceStep();
    };
  });
}

/* ---------- 发现 ---------- */
function deckList() {
  const p = (S.user && S.user.prefs) || defaultPrefs();
  const mine = S.user ? S.user.tags : [];
  const ageRange = Number(String(p.ageRange).replace('±', ''));
  return SEED.filter(c => !S.likes.includes(c.id) && !S.passes.includes(c.id))
    .map(c => {
      const common = mine.filter(t => c.tags.includes(t)).length;
      const s = scoresOf(c);
      const fit = common * 3
        + (p.sameCity && S.user && c.city === S.user.city ? 6 : 0)
        + (S.user && Math.abs(c.age - S.user.age) <= ageRange ? 4 : 0)
        + (p.verified && c.verified ? 3 : 0);
      return { ...c, s, common, rank: s.total + fit };
    })
    .sort((a, b) => b.rank - a.rank);
}

function renderDeck() {
  const list = deckList();
  const top3 = list.slice(0, 3);
  const mine = S.user ? S.user.tags : [];
  $('#deck').innerHTML = top3.map((c, i) => {
    const common = mine.filter(t => c.tags.includes(t));
    const p = PROFILE[c.id] || {};
    return `
    <article class="card" data-id="${c.id}" style="z-index:${10 - i};${i ? `transform:translateY(${i * 9}px) scale(${1 - i * 0.04});` : ''}">
      <div class="card-photo" data-open="${c.id}">
        <img src="${photoFor(c)}" alt="${esc(c.name)}" />
        <div class="card-shade"></div>
        <div class="card-score"><b>${c.s.total}%</b><span>综合同频</span></div>
        <div class="card-meta">
          <h3>${esc(c.name)} <i>${c.age}</i>${c.verified ? '<em>已实名</em>' : ''}</h3>
          <p>${esc(c.city)} · ${esc(c.dist)} · ${esc(p.job || '')}</p>
          <p class="dual">认知 ${c.s.cog}% · 兴趣 ${c.s.int}% · 眼缘 ${c.s.face}%</p>
        </div>
      </div>
      <div class="card-body">
        <p class="declaration">「${p.loveView || '--'}」</p>
        <div class="tagrow">${c.tags.map(t => `<span>${t}</span>`).join('')}</div>
        ${common.length ? `<div class="common-topics"><b>${common.length} 个共同话题</b>${common.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
        <button class="ai-line" data-open="${c.id}">✦ AI 速览：${esc(aiBrief(c))}</button>
        <div class="card-actions">
          <button class="btn btn-ghost btn-round" data-act="pass">跳过</button>
          <button class="btn btn-primary btn-like" data-act="like">想认识</button>
        </div>
      </div>
    </article>`;
  }).join('');
  $('#deck').querySelectorAll('[data-open]').forEach(el => {
    el.onclick = e => { e.stopPropagation(); openDetail(el.dataset.open); };
  });
  $('#deck').querySelectorAll('[data-act]').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); likeTop(btn.dataset.act === 'like'); };
  });
  const empty = list.length === 0;
  $('#deckEmpty').hidden = !empty;
  $('#deckActions').style.display = empty ? 'none' : 'flex';
  updateLikesPill();
}

function updateLikesPill() {
  const used = todayUsed();
  const pill = $('#todayLikes');
  pill.textContent = isMember() ? '会员 · 无限喜欢' : `今日喜欢 ${used}/${FREE_LIKES}`;
  $('#btnMember').textContent = isMember() ? '已开通' : '会员';
  const badge = $('#likesBadge');
  const n = SEED.filter(c => c.likesYou && !S.matches.some(m => m.id === c.id)).length;
  badge.textContent = n;
  badge.style.display = n ? '' : 'none';
}

function likeTop(like) {
  const top = $('#deck .card');
  if (!top) return;
  const id = top.dataset.id;
  const cand = SEED.find(c => c.id === id);
  if (!cand) return;

  if (like) {
    if (!isMember() && todayUsed() >= FREE_LIKES) {
      toast('今日喜欢次数已用完，开通会员可无限喜欢');
      openSheet('pay');
      return;
    }
  }
  top.classList.add(like ? 'fly-right' : 'fly-left');
  if (like) {
    S.likes.push(id);
    LS.set('likes', S.likes);
    S.daily = { day: todayKey(), n: todayUsed() + 1 };
    LS.set('daily', S.daily);
    if (cand.likesYou) {
      setTimeout(() => { addMatch(cand); }, 320);
    }
  } else {
    S.passes.push(id);
    LS.set('passes', S.passes);
  }
  setTimeout(() => { renderDeck(); renderMe(); }, 330);
  updateLikesPill();
}

function addMatch(cand) {
  if (S.matches.some(m => m.id === cand.id)) return;
  S.matches.unshift({ id: cand.id, ts: Date.now() });
  LS.set('matches', S.matches);
  if (!S.msgs[cand.id]) {
    S.msgs[cand.id] = [{
      me: false, t: Date.now(),
      text: pickGreeting(cand)
    }];
  }
  LS.set('msgs', S.msgs);
  $('#mcName').textContent = `你和 ${cand.name} 配对成功`;
  const sm = scoresOf(cand);
  $('#mcScore').textContent = `认知同频度 ${sm.cog}% · 兴趣同频度 ${sm.int}%`;
  $('#mcMe').innerHTML = S.user && S.user.avatar ? `<img src="${S.user.avatar}" />` : '🙂';
  $('#mcTa').innerHTML = `<img src="${avatarFor(cand)}" alt="${esc(cand.name)}" />`;
  $('#matchOverlay').hidden = false;
  $('#mcChat').onclick = () => { $('#matchOverlay').hidden = true; openChat(cand.id); };
  $('#mcLater').onclick = () => { $('#matchOverlay').hidden = true; };
  updateLikesPill();
}

function pickGreeting(c) {
  const common = (S.user ? S.user.tags : []).filter(t => c.tags.includes(t));
  if (common.length) return `我们竟然都选了「${common[0]}」，太巧了吧 😊`;
  return '嗨，看到你的兴趣画像了，感觉我们会聊得来～';
}

/* ---------- 消息列表 ---------- */
function renderMatches() {
  const list = $('#matchList');
  const rows = S.matches.map(m => {
    const c = SEED.find(x => x.id === m.id);
    if (!c) return '';
    const ms = S.msgs[c.id] || [];
    const last = ms[ms.length - 1];
    const preview = last ? (last.text || (last.image ? '[图片]' : '[语音]')) : '配对成功，打个招呼吧';
    return `<button class="match-row" data-id="${c.id}">
      <div class="mr-ava"><img src="${avatarFor(c)}" alt="${esc(c.name)}" /><span class="online-dot"></span></div>
      <div class="mr-main"><b>${esc(c.name)}</b><p>${esc(preview)}</p></div>
      <span class="mr-time">${last ? fmtTime(last.t) : ''}</span>
    </button>`;
  }).join('');
  list.innerHTML = rows;
  $('#matchHint').hidden = S.matches.length > 0;
  $('.match-list').style.display = S.matches.length ? 'flex' : 'none';
}

/* ---------- 聊天 ---------- */
function openChat(id) {
  const c = SEED.find(x => x.id === id);
  if (!c) return;
  currentChat = id;
  $('#chatName').textContent = c.name;
  const sm = scoresOf(c);
  $('#chatMeta').textContent = `认知 ${sm.cog}% · 兴趣 ${sm.int}% · 在线`;
  $('#chatAva').innerHTML = `<img src="${avatarFor(c)}" alt="${esc(c.name)}" />`;
  renderChat();
  renderTopicCards(c);
  $('#chatOverlay').hidden = false;
  setTab('matches');
  setTimeout(() => { $('#chatBody').scrollTop = 1e6; }, 30);
}

function renderChat() {
  const ms = S.msgs[currentChat] || [];
  const body = $('#chatBody');
  body.innerHTML = `<div class="chat-day">今天</div>` + ms.map((m, i) => {
    if (m.role === 'coach') {
      return `<div class="bubble coach"><b>同频红娘</b><span>${esc(m.text)}</span>${
        m.suggest ? `<button class="coach-send" data-i="${i}"${m.used ? ' disabled' : ''}>${m.used ? '已发送 ✓' : '就发这句，一键发出 ›'}</button>` : ''
      }</div>`;
    }
    const inner = m.text ? esc(m.text)
      : m.image ? `<img src="${m.image}" />`
      : m.audio ? `<audio controls src="${m.audio}"></audio><span class="tiny">${m.dur || ''}</span>` : '';
    return `<div class="bubble ${m.me ? 'me' : 'ta'}">${inner}<span class="btime">${fmtTime(m.t)}</span></div>`;
  }).join('');
  body.scrollTop = body.scrollHeight;
  $$('#chatBody .coach-send').forEach(btn => {
    btn.onclick = () => {
      const msg = (S.msgs[currentChat] || [])[Number(btn.dataset.i)];
      if (!msg || !msg.suggest || msg.used) return;
      msg.used = true;
      LS.set('msgs', S.msgs);
      pushMsg(currentChat, { me: true, text: msg.suggest, t: Date.now() });
      candidateReply(currentChat, msg.suggest);
    };
  });
}

function pushMsg(id, msg) {
  if (!S.msgs[id]) S.msgs[id] = [];
  S.msgs[id].push(msg);
  LS.set('msgs', S.msgs);
  if (currentChat === id && !$('#chatOverlay').hidden) renderChat();
  renderMatches();
}

/* 低信息开场白：只回一个字，用来演示“为什么尬聊会死” */
const DRY_OPENER = ['在吗', '在么', '在不在', '你好', 'hi', '嗨', 'hello', '哈喽', '忙吗', '干嘛呢', '在干嘛'];
function isDryOpener(t) {
  const s = (t || '').trim().toLowerCase().replace(/[？?！!。.]/g, '');
  return s.length > 0 && s.length <= 6 && DRY_OPENER.some(k => s.includes(k));
}

/* 先接住用户说的具体内容，再反问；接不住才退回到通用追问 */
function replyTo(c, userText) {
  const t = (userText || '').trim();
  if (!t) return '怎么了？';
  if (t === '__image__') return '这张是哪儿拍的？光线挺好的，是出去玩的时候吗？';
  if (isDryOpener(t)) return '在。';
  const topic = TOPIC_REPLY.find(x => x.k.some(k => t.includes(k)));
  if (topic) return topic.r;
  const hitTag = c ? c.tags.find(tg => t.includes(tg)) : null;
  if (hitTag && TA_REPLY[hitTag]) return TA_REPLY[hitTag];
  if (/[？?]|吗|呢|怎么|什么|为什么|哪儿|哪|如何/.test(t) && c) {
    const first = c.tags[0];
    if (TA_REPLY[first]) return TA_REPLY[first];
  }
  const pool = [
    '你这么一说我倒想起一件事，等我理理再跟你讲。',
    '这个话题我有话说，不过我想先听你的。',
    '你说话挺有意思的。你是本来就这样，还是今天心情好？',
    '嗯，我在想怎么回你。你周末一般怎么安排？'
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function candidateReply(id, userText) {
  const c = SEED.find(x => x.id === id);
  const text = replyTo(c, userText);

  const body = $('#chatBody');
  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<i></i><i></i><i></i>';
  if (currentChat === id && !$('#chatOverlay').hidden) { body.appendChild(typing); body.scrollTop = 1e6; }

  setTimeout(() => {
    typing.remove();
    pushMsg(id, { me: false, text, t: Date.now() });
    if (currentChat === id && !$('#chatOverlay').hidden) setTimeout(() => { body.scrollTop = 1e6; }, 20);

    /* TA 只回很短一句：红娘主动进场救场，不用等用户点按钮 */
    if (userText && text.length <= 8) {
      setTimeout(() => {
        if (currentChat !== id || $('#chatOverlay').hidden) return;
        const common = (S.user ? S.user.tags : []).filter(x => c && c.tags.includes(x));
        const tag = common[0] || (c ? c.tags[0] : '旅行');
        pushMsg(id, {
          role: 'coach', t: Date.now(), suggest: PICKUP[tag] || PICKUP['旅行'],
          text: '（红娘）TA 只回了一个字，不是你被敷衍了，是这句话本身没给 TA 接的地方——“在吗”只能换来“在”。别接着问“在干嘛”，换一个具体的东西递过去，我写好了一句。'
        });
      }, 1600);
    }
  }, 1200 + Math.random() * 900);
}

/* ---------- 语音 ---------- */
let recorder = null, recChunks = [], recStream = null, recTimer = null, recSeconds = 0;

async function startRecording() {
  if (!navigator.mediaDevices || !window.MediaRecorder) { toast('当前环境不支持录音'); return; }
  try {
    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    toast('没有麦克风权限，无法录音');
    return;
  }
  recChunks = []; recSeconds = 0;
  recorder = new MediaRecorder(recStream);
  recorder.ondataavailable = e => { if (e.data.size) recChunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(recChunks, { type: recorder.mimeType || 'audio/webm' });
    const dur = `${String(Math.floor(recSeconds / 60)).padStart(2, '0')}:${String(recSeconds % 60).padStart(2, '0')}`;
    const fr = new FileReader();
    fr.onload = () => pushMsg(currentChat, { me: true, audio: fr.result, dur, t: Date.now() });
    fr.readAsDataURL(blob);
    recStream.getTracks().forEach(t => t.stop());
    $('#recordingBar').hidden = true;
    toast('语音已发送');
  };
  recorder.start();
  $('#recordingBar').hidden = false;
  $('#recTime').textContent = '00:00';
  recTimer = setInterval(() => {
    recSeconds++;
    $('#recTime').textContent = `${String(Math.floor(recSeconds / 60)).padStart(2, '0')}:${String(recSeconds % 60).padStart(2, '0')}`;
    if (recSeconds >= 30) stopRecording();
  }, 1000);
}

function stopRecording() {
  clearInterval(recTimer);
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  recorder = null;
}

/* ---------- 会员 ---------- */
let currentPlan = 'month';
function openSheet(which) {
  const id = which === 'pay' ? '#payOverlay' : '#likesOverlay';
  if (which === 'likes') renderLikesSheet();
  $(id).hidden = false;
}

function renderLikesSheet() {
  const liked = SEED.filter(c => c.likesYou && !S.matches.some(m => m.id === c.id));
  $('#likesCount').textContent = liked.length;
  $('#likesGrid').innerHTML = liked.map(c => {
    if (isMember()) {
      return `<button class="like-cell" data-id="${c.id}"><img src="${avatarFor(c)}" alt="${esc(c.name)}" /></button>`;
    }
    return `<div class="like-cell locked"><img src="${avatarFor(c)}" /></div>`;
  }).join('') || `<p class="tiny muted center" style="grid-column:1/-1">暂时还没有人喜欢你</p>`;
  $('#likesLockNote').hidden = isMember();
  $('#likesCta').hidden = isMember();
  $$('#likesGrid .like-cell[data-id]').forEach(el => el.onclick = () => {
    const c = SEED.find(x => x.id === el.dataset.id);
    if (c) { $('#likesOverlay').hidden = true; addMatch(c); }
  });
}

function buyMembership() {
  const days = currentPlan === 'year' ? 365 : 30;
  const base = isMember() ? S.member : Date.now();
  S.member = base + days * 24 * 3600 * 1000;
  LS.set('member', S.member);
  $('#payOverlay').hidden = true;
  toast(`会员已开通（演示）· 有效期至 ${new Date(S.member).toLocaleDateString('zh-CN')}`);
  updateLikesPill(); renderMe(); renderLikesSheet();
}

/* ---------- 我的 ---------- */
function renderMe() {
  if (!S.user) return;
  const u = S.user;
  $('#meAvatar').innerHTML = u.avatar ? `<img src="${u.avatar}" />` : '🙂';
  $('#meName').textContent = u.name;
  const g = { f: '女生', m: '男生', x: '保密' }[u.gender] || '保密';
  $('#meMeta').textContent = `${u.age} 岁 · ${u.city} · ${g}`;
  $('#meTags').innerHTML = (u.tags || []).map(t => `<span>${t}</span>`).join('');
  $('#statLikes').textContent = S.likes.length;
  $('#statMatches').textContent = S.matches.length;
  $('#meMemberBtn').textContent = isMember() ? '会员至 ' + new Date(S.member).toLocaleDateString('zh-CN') : '开通会员';
  $('#btnMember').textContent = isMember() ? '已开通' : '会员';
}

function aiBrief(c) {
  const common = (S.user ? S.user.tags : []).filter(t => c.tags.includes(t));
  const cog = (COG[c.id] || [])[0] || '';
  return `${cog}型，${common.length ? `和你共享「${common[0]}」` : `常年在${c.tags[0]}里`}，适合从具体经历聊起。`;
}

function detailSummary(c, p, s, common) {
  const cog = COG[c.id] || [];
  const part1 = `TA 的认知画像是「${cog.join('、')}」，恋爱节奏偏「${p.loveView || '--'}」。`;
  const part2 = common.length
    ? `你们有 ${common.length} 个共同兴趣（${common.join('、')}），从「${common[0]}」的具体经历聊起最自然。`
    : `兴趣交集不多，但认知同频 ${s.cog}%，可以先聊工作日的状态，再过渡到兴趣。`;
  const part3 = cog.includes('慢热')
    ? '提醒：慢热的人前期回复可能偏慢，别把延迟当成拒绝。'
    : '提醒：TA 表达比较直接，聊天不用反复猜。';
  return part1 + part2 + part3;
}

function openDetail(id) {
  const c = SEED.find(x => x.id === id);
  if (!c) return;
  const p = PROFILE[id] || {};
  const s = scoresOf(c);
  const common = (S.user ? S.user.tags : []).filter(t => c.tags.includes(t));
  const cells = [
    ['身高', p.h ? p.h + 'cm' : '--'], ['学历', p.edu], ['职业', p.job],
    ['认知类型', (COG[id] || [])[0]], ['恋爱节奏', p.loveView]
  ];
  $('#detailPage').innerHTML = `
    <div class="detail-hero">
      <img src="${photoFor(c)}" alt="${esc(c.name)}" />
      <div class="detail-shade"></div>
      <button class="detail-back" id="detailBack">‹</button>
      <div class="detail-hero-meta">
        <h2>${esc(c.name)} <i>${c.age}</i>${c.verified ? '<em>已实名</em>' : ''}</h2>
        <p>${esc(c.city)} · ${esc(c.dist)}</p>
      </div>
    </div>
    <div class="detail-body">
      <div class="info-grid">
        ${cells.map(([k, v]) => `<div><span>${k}</span><b>${esc(v || '--')}</b></div>`).join('')}
      </div>
      <div class="ai-summary"><b>✦ AI 速览</b><p>${esc(detailSummary(c, p, s, common))}</p></div>
      <h3 class="detail-h">关于我</h3>
      <p class="detail-text">${esc(c.bio)}</p>
      <h3 class="detail-h">兴趣</h3>
      <div class="tagrow">${c.tags.map(t => `<span>${t}</span>`).join('')}</div>
      <h3 class="detail-h">你们的匹配</h3>
      <div class="match-bars">
        <div><span>认知同频</span><div class="bar-track"><i style="width:${s.cog}%"></i></div><b>${s.cog}%</b></div>
        <div><span>兴趣同频</span><div class="bar-track"><i style="width:${s.int}%"></i></div><b>${s.int}%</b></div>
        <div><span>眼缘</span><div class="bar-track"><i style="width:${s.face}%"></i></div><b>${s.face}%</b></div>
      </div>
      <p class="tiny muted">三项分数只用于排序，不预测结果。</p>
    </div>
    <div class="detail-actions">
      <button class="btn btn-ghost" id="detailPass">跳过</button>
      <button class="btn btn-primary" id="detailLike">想认识</button>
    </div>`;
  $('#detailOverlay').hidden = false;
  $('#detailBack').onclick = () => { $('#detailOverlay').hidden = true; };
  $('#detailPass').onclick = () => { $('#detailOverlay').hidden = true; likeTop(false); };
  $('#detailLike').onclick = () => { $('#detailOverlay').hidden = true; likeTop(true); };
}

/* ---------- 我的同频报告 ---------- */
function modelReport(sc) {
  const ep = ecrPlain(sc.ecr);
  const bf = topBf(sc.bf, 5);
  const eh = topEh(sc.eh, 3);
  const low = lowEh(sc.eh, 2);
  return `
  <section class="rpt-card">
    <span class="rpt-kicker">亲密关系模式</span>
    <div class="rpt-title">${ep.name}</div>
    <p class="rpt-line">${ep.line}</p>
    <p class="rpt-tip">${ep.tip}</p>
  </section>
  <section class="rpt-card">
    <span class="rpt-kicker">性格底色</span>
    <div class="rpt-chips">${bf.map(x => `<span>${x.name} ${bfLevel(x.v)}</span>`).join('')}</div>
    <p class="rpt-line">你看待事情的方式，会决定你们日常相处的节奏。</p>
  </section>
  <section class="rpt-card">
    <span class="rpt-kicker">长期相处观</span>
    <div class="rpt-chips">${eh.map(k => `<span>${k}</span>`).join('')}</div>
    <p class="rpt-line">这些是长期生活里最容易起摩擦的地方，比兴趣更影响能不能走下去。</p>
    <p class="rpt-tip">需要留意：${low.join('、')}</p>
  </section>
  <div class="rpt-note">来自你注册时的 24 道题 · 只用于匹配，不会展示给其他人</div>`;
}

function openModels() {
  const sc = S.user && S.user.scales;
  $('#modelBody').innerHTML = sc ? modelReport(sc)
    : `<div class="rpt-empty">还没有你的同频报告。<br>完成注册时的 24 道题，这里会显示你在亲密关系、性格和长期相处上的样子。</div>`;
  $('#modelOverlay').hidden = false;
}

const TAG_PROMPT = {
  旅行: '你去过最想再去一次的地方是哪儿？为什么想再去？',
  咖啡: '你喝咖啡，是为了清醒，还是为了那十分钟的安静？',
  摄影: '你手机里最舍不得删的一张照片，拍的是什么？',
  运动: '你坚持最久的一项运动是什么？还在坚持吗？',
  美食: '你会为了一顿饭，专门跑一趟吗？跑过最远的一次是？',
  电影: '有没有一部电影，你看完想立刻找人聊？',
  音乐: '最近一直循环的一首歌是什么？',
  游戏: '你玩过最上头的一款游戏？现在还在玩吗？',
  阅读: '你最近在看什么书？值得推荐吗？',
  宠物: '如果现在养一只，你想养什么？为什么？',
  手作: '你做过最得意的一件手作是什么？',
  户外: '你更喜欢山，还是海？'
};
const FALLBACK_PROMPTS = [
  '最近有什么小事，让你觉得「今天还不错」？',
  '你上一次临时起意去做一件事，是什么时候？',
  '如果明天多出半天空闲，你会拿来做什么？'
];

function renderTopicCards(c) {
  const mine = S.user ? S.user.tags : [];
  const common = mine.filter(t => c.tags.includes(t));
  const picked = [...new Set([...common, ...c.tags])].slice(0, 3);
  const cards = picked.map((t, i) => ({
    label: `共同兴趣 · ${t}`,
    text: TAG_PROMPT[t] || FALLBACK_PROMPTS[i]
  }));
  while (cards.length < 3) {
    cards.push({ label: '随便聊聊', text: FALLBACK_PROMPTS[cards.length] });
  }
  $('#topicCards').innerHTML = cards.map(card => `
    <button class="topic-card" data-text="${esc(card.text)}">
      <b>${esc(card.label)}</b>
      <span>${esc(card.text)}</span>
    </button>`).join('');
  $('#topicCards').hidden = false;
}

function openCoach() {
  const c = SEED.find(x => x.id === currentChat);
  if (!c) return;
  const mine = S.user ? S.user.tags : [];
  const common = mine.filter(t => c.tags.includes(t));
  const tag = common[0] || c.tags[0] || '';
  const sm = scoresOf(c);
  const p = PROFILE[c.id] || {};
  const hooks = HOOKS[c.id] || [];
  $('#coachList').innerHTML = `
    <div class="coach-person">
      <img src="${photoFor(c)}" alt="" />
      <div>
        <b>${esc(c.name)} · ${c.age}</b>
        <p class="tiny muted">${esc(c.city)} · ${esc(p.job || '')} · 眼缘 ${sm.face}%</p>
        <p class="tiny muted">${esc(c.bio)}</p>
      </div>
    </div>
    <div class="coach-sec">基于 TA 的照片和资料，可以直接发</div>
    ${hooks.map(h => `<button class="coach-item coach-senditem" data-send="${esc(h)}"><b>一键发送 ›</b><span>${esc(h)}</span></button>`).join('')}
    ${common.length ? `<div class="coach-sec">你们的共同话题：${common.join(' · ')}</div>` : ''}
    <button class="coach-item" data-text="${esc(TAG_PROMPT[tag] || FALLBACK_PROMPTS[0])}"><b>话题切入</b><span>${esc(TAG_PROMPT[tag] || FALLBACK_PROMPTS[0])}</span></button>
    <button class="coach-item" data-text="听起来你今天有点累，先不聊正事也行。"><b>对方回得很短</b><span>别追问，先给情绪：「听起来你今天有点累，先不聊正事也行。」</span></button>
    <button class="coach-item" data-text="我们有 ${Math.max(1, common.length)} 个共同话题，要不要挑一个一起做？"><b>见面之前</b><span>认知 ${sm.cog}% · 兴趣 ${sm.int}% · 眼缘 ${sm.face}%。第一次见面控制在 90 分钟内。</span></button>`;
  $('#coachOverlay').hidden = false;
}

/* ---------- 见面后回访：模型的唯一校准信号 ---------- */
let fb = { photo: null, again: null };
function openFeedback() {
  fb = { photo: null, again: null };
  $('#fbOverlay').hidden = false;
  $('#fbOverlay').querySelectorAll('.chip').forEach(x => x.classList.remove('is-on'));
  $('#fbSave').disabled = true;
}

/* ---------- 理想型：模型先猜，用户可 double check ---------- */
function defaultPrefs() {
  return { sameCity: true, ageRange: '±5', commonTags: 2, verified: false, pace: '先做朋友' };
}
function idealStatements(p) {
  return [
    p.sameCity ? '更想找同城的，先从线下见面开始' : '异地也可以接受',
    `年龄差控制在 ${p.ageRange} 岁`,
    `至少有 ${p.commonTags} 个共同兴趣`,
    p.verified ? '只看已实名认证的人' : '实名认证不是硬门槛',
    `节奏偏「${p.pace}」`
  ];
}
function renderIdealPreview(p) {
  const stmts = idealStatements(p);
  $('#idealPreview').innerHTML = stmts.map(s => `<div class="ideal-item"><span>✓</span>${esc(s)}</div>`).join('');
}
function openPrefs() {
  const p = (S.user && S.user.prefs) || defaultPrefs();
  $('#prefsOverlay').querySelectorAll('.chips').forEach(group => {
    const key = group.dataset.p;
    const val = String(p[key]);
    group.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('is-on', c.dataset.v === val);
    });
  });
  $('#prefsOverlay').hidden = false;
}
function readPrefs() {
  const p = {};
  $('#prefsOverlay').querySelectorAll('.chips').forEach(group => {
    const sel = group.querySelector('.chip.is-on');
    if (sel) {
      const v = sel.dataset.v;
      p[group.dataset.p] = v === 'true' ? true : v === 'false' ? false : isNaN(Number(v)) ? v : Number(v);
    }
  });
  return p;
}

/* ---------- 红娘开口：直接出现在对话流里（三人桌边） ---------- */
const TA_REPLY = {
  旅行: '上个月一个人去了大理，绕着洱海骑了一下午，晒黑了一圈。你最近一次出门是去哪儿？',
  咖啡: '早上手冲，晚上就不碰了，不然睡不着。你是每天一杯，还是想起来才喝？',
  摄影: '手机里最舍不得删的是一张雨后的弄堂，光线刚好。你拍照是随手拍还是专门等？',
  运动: '跑步坚持三年了，最近在练攀岩。你平时动得多吗？',
  美食: '会为一家店跨城跑，上周为了一碗面坐了一小时地铁。你呢？',
  电影: '看完《爱在黎明破晓前》那天，特别想找人聊一整晚。你有这种电影吗？',
  音乐: '最近循环的是 live 现场的录音，越听越想出门。你听歌戴耳机还是外放？',
  游戏: '最近在玩双人成行，一个人玩没意思。你玩游戏吗？',
  阅读: '在看一本讲城市的老书，越看越想出门走。你最近在看什么？',
  宠物: '家里两只猫，一只黏人一只高冷。你养宠物吗？',
  手作: '做陶最上头，一坐一下午手机都不看。你有这种一坐一下午的事吗？',
  户外: '更喜欢山，海太安静了容易走神。你呢？'
};

/* 破冰钩子：全部来自对方的照片、简介、职业、兴趣，不是通用话术 */
const HOOKS = {
  c1: ['你头像是坐在窗边拍的吧？那种下午的光我一眼就认出来了。', '你说想去的地方还有 37 个，清单第一个是哪儿？', '拍完照就去赶火车，这件事听着就很像你。'],
  c2: ['早跑和攀岩是同时在坚持吗？能同时做两样的人挺少见。', '金毛叫什么？你跑步的时候它会跟着吗？'],
  c3: ['音乐老师下班以后，还会想听歌吗？', '你说“看感觉，不设限”，有没有哪次上头得特别突然？'],
  c4: ['你照片里那种光线，是等出来的还是碰上的？', '自由摄影师最常待的地方是哪儿？我想跟着走一次。'],
  c5: ['你头像那只杯子，是你自己做的吗？', '咖啡师休息日还做陶，手是不是一天都没停过？'],
  c6: ['你片单 400+，最近哪部让你想立刻找人聊？', '连麦到两点，第二天上班你是怎么扛过去的？'],
  c7: ['两只猫叫什么？黏人的那只会坐你键盘上吗？', '“烘焙翻车现场专家”——最惨的一次是什么样？'],
  c8: ['攀岩和跑步，哪个更让你上瘾？', '你话不多，但一聊到石头应该停不下来吧？'],
  c9: ['你照片里那张是胶片拍的吗？颗粒感一眼就看到。', '拍人不爱让人看镜头——最放松的一张拍的是谁？'],
  c10: ['你手冲用哪支豆子？我最近总冲得太酸。', '能聊三个小时的导演，你第一个想到谁？'],
  c11: ['柯基叫什么？皮具和狗，哪个更费时间？', '给朋友做礼物，收到的人一般什么反应？'],
  c12: ['厨师下班还去健身房，这体力我服。', '你最拿手的一道菜是什么？我点这个。']
};

const COACH_FOLLOW = {
  旅行: '接一句“一个人去不无聊吗”，再补一段你自己的出行，留一半给对方问。',
  咖啡: '接一句“那你不喝咖啡会怎样”，轻松的问题最容易接下去。',
  摄影: '接一句“那张照片能发我看看吗”，要具体的东西，别要评价。',
  运动: '接一句“攀岩难吗”，让对方教你一件事，关系就推进了。',
  美食: '接一句“那碗面值得吗”，吃是最安全的共同话题。',
  电影: '接一句“我也有，下次可以一起看”，把话题变成未来的行动。',
  音乐: '接一句“你最近一次去现场是什么时候”，现场比歌单更有画面。',
  游戏: '接一句“双人成行我还没玩过，难吗”，给对方一个教你的机会。',
  阅读: '接一句“那本书哪句让你记住了”，比问好不好看有效。',
  宠物: '接一句“黏人的那只叫什么”，名字是最好的切入点。',
  手作: '接一句“做陶最难的是哪一步”，让对方讲过程。',
  户外: '接一句“山还是海，我选海，因为我会晕高”，用自嘲换轻松。'
};

/* 用户说到这些具体话题时，TA 一定能接住并反问（比通用追问有信息量） */
const TOPIC_REPLY = [
  { k: ['加班', '上班', '工作', '项目', '老板', '出差', '开会'], r: '这周确实忙，连着加了几天，回家只想躺着。你是那种加完班必须缓一天的人吗？' },
  { k: ['周末', '休息', '放假'], r: '周末我一般留半天给自己，剩下半天出门。你周末是那种排满的人，还是留白的人？' },
  { k: ['猫', '橘猫', '撸猫'], r: '我家里那只一到晚上就踩我键盘。你撸猫是吸那种，还是只敢看？' },
  { k: ['狗', '金毛', '遛狗'], r: '我朋友的金毛每次见我都扑上来。你喜欢大型犬还是小型犬？' },
  { k: ['健身', '跑步', '攀岩', '游泳', '运动', '瑜伽'], r: '我跑步三年了，最近才开始练攀岩，手酸得握不住杯子。你平时动得多吗？' },
  { k: ['爬山', '徒步', '露营', '户外'], r: '上次爬到一半下雨，反而觉得值。你更怕累，还是更怕无聊？' },
  { k: ['电影', '剧', '影院', '追剧'], r: '我最近在补老片，越看越觉得二十几岁的人想法真好。你有那种看完想立刻找人聊的电影吗？' },
  { k: ['音乐', '演唱会', 'live', '歌'], r: '我不太听新歌，反反复复就那几首现场版。你最近一次去现场是什么时候？' },
  { k: ['书', '阅读', '小说', '看书'], r: '我在看一本讲城市的老书，越看越想出门走。你最近在看什么，值得推荐吗？' },
  { k: ['吃', '饭', '火锅', '面', '餐厅', '探店'], r: '我会为一家店跨城跑，上周为了一碗面坐了一小时地铁。你愿意为一顿饭跑多远？' },
  { k: ['旅行', '出去玩', '去玩', '度假', '大理', '海边'], r: '上个月一个人去了大理，绕着洱海骑了一下午，晒黑了一圈。你最近一次出门是去哪儿？' },
  { k: ['睡不着', '失眠', '熬夜', '睡'], r: '我最近也睡得晚，明明躺下了还在刷手机。你几点算“该睡了”？' },
  { k: ['游戏', '打游戏', '上分'], r: '最近在玩双人成行，一个人玩没意思。你玩游戏吗，还是完全不碰？' },
  { k: ['拍照', '摄影'], r: '手机里最舍不得删的是一张雨后的弄堂，光线刚好。你拍照是随手拍还是专门等？' },
  { k: ['天气', '下雨', '降温'], r: '这两天一变天我就犯懒。你是喜欢雨天的人，还是讨厌？' },
  { k: ['老家', '爸妈', '家人'], r: '我每年回去两三次，待久了反而不舍得走。你多久回一次？' }
];

/* 冷场时直接能发出去的一句（不是建议，是成品） */
const PICKUP = {
  旅行: '大理我还没去过。你那次住哪儿？我照着你的路线走一遍。',
  咖啡: '你一般几点喝？我最近下午总犯困，想跟着你换换习惯。',
  摄影: '你说的那张照片，能发我看看吗？我最近在学怎么拍光影。',
  运动: '攀岩难吗？我一直想试，但怕自己上不去就下不来。',
  美食: '那碗面值得跑一趟吗？说店名，我周末就去。',
  电影: '你说的那部我也没看过。要不要定个时间，一起看完再聊？',
  音乐: '你最近一次去现场是什么时候？我想跟着你去听一次。',
  游戏: '双人成行我还没玩过，难吗？我上手慢，你得教教我。',
  阅读: '那本书哪句让你记住了？我正好想找一本睡前能看的。',
  宠物: '黏人的那只叫什么？听着就想去你家撸猫。',
  手作: '做陶最难的是哪一步？我一直觉得手笨的人做不了。',
  户外: '山还是海？我选海，因为我晕高——这个理由够真诚吧。'
};

/* 对方已经给了具体细节后，你这边可以直接发出去的一句（有回应+有自己） */
const COACH_SEND = {
  旅行: '一个人去不无聊吗？我上次一个人出门，反而在路边坐了一下午，没人催我走。',
  咖啡: '那你不喝咖啡会怎样？我是那种下午一犯困就整个人离线的人。',
  摄影: '那张照片能发我看看吗？我最近在学怎么等光，总是等不到。',
  运动: '攀岩难吗？我一直想试，但怕自己上去了下不来。',
  美食: '那碗面值得跑一小时地铁吗？说店名，我周末就去。',
  电影: '我也有那种电影。下次一起看？看完正好可以聊一整晚。',
  音乐: '你最近一次去现场是什么时候？我想跟着你去听一次。',
  游戏: '双人成行我还没玩过，难吗？我上手慢，你得有点耐心。',
  阅读: '那本书哪句让你记住了？我正好想找一本睡前能看的。',
  宠物: '黏人的那只叫什么？听着就想去你家撸猫了。',
  手作: '做陶最难的是哪一步？我一直觉得自己是手笨那一类。',
  户外: '我也选海。山我爬一半就想坐下，海我可以什么都不做。'
};

function coachSpeak() {
  const id = currentChat;
  const c = SEED.find(x => x.id === id);
  if (!c) return;
  const ms = S.msgs[id] || [];
  const myCount = ms.filter(m => m.me).length;
  const taMsgs = ms.filter(m => !m.me && m.role !== 'coach');
  const lastTa = taMsgs[taMsgs.length - 1];
  const lastMine = ms.filter(m => m.me).slice(-1)[0];
  const common = (S.user ? S.user.tags : []).filter(t => c.tags.includes(t));
  const tag = common[0] || c.tags[0];

  /* 对方连续短回复：红娘劝你止损，而不是教你继续追 */
  if (myCount >= 2 && lastTa && lastTa.text && lastTa.text.length <= 6) {
    pushMsg(id, {
      role: 'coach', t: Date.now(),
      text: '（红娘）对方连着回得很短。别再追问了——这不是你不够好，是对方现在没投入。建议换人，我把同频度更高的下一个顶上来。'
    });
    return;
  }

  /* 我发了消息、TA 还没回：别追问"在吗"，红娘直接给一句成品 */
  if (lastMine && (!lastTa || lastMine.t > lastTa.t)) {
    pushMsg(id, {
      role: 'coach', t: Date.now(), suggest: PICKUP[tag] || PICKUP['旅行'],
      text: '（红娘）TA 现在没回，多半不是没兴趣，是不知道接什么。别发"在吗"，用一句带具体信息的话把球递过去——我写好了，你直接发。'
    });
    return;
  }

  if (myCount < 1) {
    const hook = (HOOKS[c.id] && HOOKS[c.id][0]) || TAG_PROMPT[tag] || FALLBACK_PROMPTS[0];
    pushMsg(id, { role: 'coach', t: Date.now(), text: `（红娘）我先替你们开个头，从 TA 自己的东西入手最不容易尬：${hook}` });
    setTimeout(() => {
      pushMsg(id, { me: false, t: Date.now(), text: TA_REPLY[tag] || `说到这个——${c.bio}` });
      setTimeout(() => {
        pushMsg(id, {
          role: 'coach', t: Date.now(), suggest: COACH_SEND[tag] || PICKUP[tag] || '我刚看到你说的，还挺想接着聊的——你最近怎么样？',
          text: `（红娘）TA 给了具体的东西，别回"哈哈"。${COACH_FOLLOW[tag] || '先接一句感受，再补一个你自己的细节。'}这句话我已经写好了，点一下就发出去。`
        });
      }, 800);
    }, 700);
    return;
  }

  /* 已经聊起来了：给一个推进建议 */
  pushMsg(id, {
    role: 'coach', t: Date.now(),
    text: `（红娘）你们已经聊开了。下一步别急着约饭，可以说："我们有 ${Math.max(1, common.length)} 个共同话题，要不要挑一个一起做？"——把线上变成一次具体的见面。`
  });
}


/* ---------- 事件绑定 ---------- */
function bind() {
  $('#ageGate').onchange = e => { $('#obStart').disabled = !e.target.checked; };
  $('#obStart').onclick = () => showObStep(1);

  $('#obAvatarInput').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      draft.avatar = await compressImage(f, 600, 0.8);
      $('#obAvatarPreview').innerHTML = `<img src="${draft.avatar}" />`;
    } catch (err) { toast('图片读取失败'); }
  };
  $('#obAvatarPreview').onclick = () => $('#obAvatarInput').click();

  $$('#obGender .chip').forEach(b => b.onclick = () => {
    draft.gender = b.dataset.v;
    $$('#obGender .chip').forEach(x => x.classList.toggle('is-on', x === b));
  });

  $('#obNext1').onclick = () => {
    draft.name = $('#obName').value.trim();
    draft.age = Number($('#obAge').value);
    draft.city = $('#obCity').value.trim();
    if (!draft.name) return toast('请填写昵称');
    if (!draft.age || draft.age < 18) return toast('需年满 18 周岁才能使用');
    if (!draft.city) return toast('请填写城市');
    if (!draft.gender) return toast('请选择性别');
    showObStep(2);
  };

  $('#obTags').onclick = e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    const t = b.dataset.t;
    if (draft.tags.includes(t)) draft.tags = draft.tags.filter(x => x !== t);
    else draft.tags.push(t);
    renderOnboardTags();
  };

  $('#obNext2').onclick = () => {
    if (draft.tags.length < 3) return toast('至少选择 3 个兴趣');
    quizIdx = 0; draft.answers = [];
    renderQuiz();
    showObStep(3);
  };

  $('#quizBody').onclick = e => {
    const b = e.target.closest('.likert-btn');
    if (!b) return;
    const i = Number(b.dataset.i);
    draft.answers[quizIdx] = i;
    $$('.likert-btn').forEach(x => x.classList.toggle('is-on', x === b));
    setTimeout(() => {
      if (quizIdx < SCALE.length - 1) { quizIdx++; renderQuiz(); }
      else { draft.faceRound = 0; draft.facePicks = []; draft.faceAvoid = []; renderFaceStep(); showObStep(4); }
    }, 220);
  };

  $('#faceSkip').onclick = () => {
    draft.facePicks = []; draft.faceAvoid = []; draft.faceW = {};
    buildProfile(); renderPortrait(); showObStep(5);
  };

  $('#obFinish').onclick = () => {
    S.user = {
      name: draft.name, age: draft.age, city: draft.city, gender: draft.gender,
      avatar: draft.avatar, tags: [...draft.tags], w: draft.vec, cogW: draft.cogW, score: draft.score,
      prefs: draft.prefs, scales: draft.scales,
      faceW: draft.faceW, facePicks: (draft.facePicks || []).map(p => p.id), faceAvoid: (draft.faceAvoid || []).map(p => p.id),
      quiz: [...draft.answers], created: Date.now()
    };
    LS.set('user', S.user);
    setTab('discover');
    renderDeck();
    toast('画像已生成，开始为你匹配');
  };

  $('#tabbar').onclick = e => {
    const b = e.target.closest('button[data-tab]');
    if (b) setTab(b.dataset.tab);
  };

  $('#btnLike').onclick = () => likeTop(true);
  $('#btnPass').onclick = () => likeTop(false);
  $('#btnRefill').onclick = () => {
    S.passes = [];
    S.likes = S.matches.map(m => m.id);
    LS.set('passes', S.passes); LS.set('likes', S.likes);
    renderDeck(); renderMe();
    toast('已重新载入，卡片回来了');
  };
  $('#btnMember').onclick = () => openSheet('pay');
  $('#meMemberBtn').onclick = () => openSheet('pay');
  $('#btnOpenLikes').onclick = () => openSheet('likes');
  $('#btnLikesEntry').onclick = () => openSheet('likes');
  $('#likesCta').onclick = () => { $('#likesOverlay').hidden = true; openSheet('pay'); };
  $('#payClose').onclick = () => { $('#payOverlay').hidden = true; };
  $('#likesClose').onclick = () => { $('#likesOverlay').hidden = true; };

  $('#plans').onclick = e => {
    const b = e.target.closest('.plan');
    if (!b) return;
    currentPlan = b.dataset.plan;
    $$('.plan').forEach(x => x.classList.toggle('is-active', x === b));
  };
  $$('.pay-method').forEach(m => m.onclick = () => $$('.pay-method').forEach(x => x.classList.toggle('is-active', x === m)));
  $('#payConfirm').onclick = buyMembership;

  $('#matchList').onclick = e => {
    const row = e.target.closest('.match-row');
    if (row) openChat(row.dataset.id);
  };
  $('#chatBack').onclick = () => { $('#chatOverlay').hidden = true; renderMatches(); };

  $('#chatSend').onclick = sendText;
  $('#chatInput').onkeydown = e => { if (e.key === 'Enter') sendText(); };
  $('#chatCoach').onclick = openCoach;
  $('#coachSpeak').onclick = coachSpeak;
  $('#coachClose').onclick = () => { $('#coachOverlay').hidden = true; };
  $('#coachList').onclick = e => {
    const it = e.target.closest('.coach-item');
    if (!it) return;
    if (it.dataset.send) {
      $('#coachOverlay').hidden = true;
      pushMsg(currentChat, { me: true, text: it.dataset.send, t: Date.now() });
      candidateReply(currentChat, it.dataset.send);
      return;
    }
    $('#chatInput').value = it.dataset.text;
    $('#coachOverlay').hidden = true;
    $('#chatInput').focus();
  };
  $('#topicCards').onclick = e => {
    const card = e.target.closest('.topic-card');
    if (!card) return;
    $('#chatInput').value = card.dataset.text;
    $('#chatInput').focus();
    toast('已放进输入框，可以改一改再发');
  };

  $('#chatImgInput').onchange = async e => {
    const f = e.target.files[0];
    if (!f || !currentChat) return;
    try {
      const data = await compressImage(f, 900, 0.7);
      pushMsg(currentChat, { me: true, image: data, t: Date.now() });
      candidateReply(currentChat, '__image__');
      if ($('#chatBody')) $('#chatBody').scrollTop = 1e6;
    } catch (err) { toast('图片处理失败'); }
    e.target.value = '';
  };
  $('#chatImgBtn').onclick = () => $('#chatImgInput').click();
  $('#chatVoiceBtn').onclick = () => {
    if ($('#recordingBar').hidden) startRecording();
    else stopRecording();
  };
  $('#recStop').onclick = stopRecording;

  $('#menuReset').onclick = () => {
    if (confirm('确定清空本机所有数据？此操作不可恢复。')) {
      Object.keys(localStorage).filter(k => k.startsWith('yq_')).forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  };
  $('#menuFeedback').onclick = openFeedback;
  $('#menuPrefs').onclick = openPrefs;
  $('#menuModels').onclick = openModels;
  $('#modelClose').onclick = () => { $('#modelOverlay').hidden = true; };
  $('#modelRetake').onclick = () => { $('#modelOverlay').hidden = true; startOnboard(true); };
  $('#prefAdjust').onclick = openPrefs;
  $('#prefsClose').onclick = () => { $('#prefsOverlay').hidden = true; };
  $('#prefsOverlay').querySelectorAll('.chips').forEach(group => {
    group.onclick = e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(x => x.classList.toggle('is-on', x === chip));
    };
  });
  $('#prefsSave').onclick = () => {
    const p = readPrefs();
    if (S.user) { S.user.prefs = p; LS.set('user', S.user); }
    draft.prefs = p;
    $('#prefsOverlay').hidden = true;
    if (!$('#screen-discover').classList.contains('is-active')) setTab('discover');
    renderDeck();
    toast('理想型已更新，匹配已重新排序');
  };
  $('#fbClose').onclick = () => { $('#fbOverlay').hidden = true; };
  $('#fbOverlay').querySelectorAll('.chips').forEach(group => {
    group.onclick = e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(x => x.classList.toggle('is-on', x === chip));
      fb[group.dataset.q] = Number(chip.dataset.v);
      $('#fbSave').disabled = !(fb.photo != null && fb.again != null);
    };
  });
  $('#fbSave').onclick = () => {
    S.feedback = [{ photo: fb.photo, again: fb.again, t: Date.now() }, ...(S.feedback || [])];
    LS.set('feedback', S.feedback);
    $('#fbOverlay').hidden = true;
    toast(fb.again === 1 ? '已记录。这类"想再见"的数据会抬高相似画像的权重' : '已记录。这类数据会降低相似画像的推荐权重');
  };
  $('#menuPrivacy').onclick = () => toast('原型演示：正式版需接入用户协议与隐私政策');
}

function sendText() {
  const input = $('#chatInput');
  const text = input.value.trim();
  if (!text || !currentChat) return;
  pushMsg(currentChat, { me: true, text, t: Date.now() });
  input.value = '';
  candidateReply(currentChat, text);
}

/* ---------- 启动 ---------- */
function init() {
  bind();
  $$('.ob-step').forEach(el => { if (el.dataset.step === '0') el.classList.add('is-active'); });
  if (S.user && !S.user.cogW) {
    /* 测评升级：旧数据只有兴趣向量，需要重做一次双维度测评 */
    S.user = null;
    LS.set('user', null);
  }
  if (S.user) {
    setTab('discover');
    renderDeck();
    renderMe();
    renderMatches();
    updateLikesPill();
  } else {
    startOnboard(false);
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();
