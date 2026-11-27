// 同频 · 阶段1 文案与动物配置（从阶段0移植，CommonJS）
// 禁止在逻辑代码硬编码文案；动物纯视觉趣味，不参与计分、不进入推荐排序。

const COPY = {
  brand: '同频',
  slogan: '先了解自己，再认真相遇',
  lead: '20 道题，看看你在关系里的样子。\n仅供娱乐参考，不构成婚恋建议。',
  ageGate: {
    title: '你已年满 18 周岁吗？',
    yes: '是，我已成年',
    no: '未满 18 周岁',
    reject: '抱歉，本测评仅面向 18 周岁以上用户。',
  },
  consent: {
    title: '在开始之前',
    items: [
      '本测评为传统文化视角的自我了解工具，仅供娱乐参考',
      '不是心理诊断，不构成婚恋建议，不代表关系成功概率',
      '测评结果仅用于生成你的画像，不用于匹配排序，不收费解锁',
    ],
    agree: '我已了解，开始测评',
  },
  section: {
    l1: '第一部分 · 认识你自己',
    l2: '第二部分 · 关系里的你',
    l1sub: '凭第一感觉作答就好',
    l2sub: '想一想你在亲密关系中的真实状态',
  },
  scale: ['很不符合', '不太符合', '一般', '比较符合', '非常符合'],
  result: {
    title: '你的同频画像',
    scoreLabel: '与你同频的人约',
    scoreUnit: '%',
    scoreNote: '风格相近的人群占比 · 不代表找到对象的概率 · 仅供娱乐参考',
    styleTitle: '你的相处风格',
    careTitle: '你在关系里最在意的 4 件事',
    careSub: '按你的作答排序，越靠上越贴合',
    adviceTitle: '给你的一条沟通建议',
    animalTitle: '你的同频小动物',
    animalNote: '按分数段随机出场，纯图一乐，和性格结论无关。',
    shareTitle: '分享卡片文案',
    shareCopy: '复制文案',
    shareSaved: '已复制，粘贴给朋友即可打开小程序一起测',
    copyFail: '复制失败，请手动选择文字',
    hooks: [
      '我居然是{animal}！你敢不敢测测自己？',
      '测完怀疑手机在偷听我说话…约{resonance}%的人和我同频，你呢？',
      '一只{animal}诞生了，这结果也太会了吧 👀',
      '花 2 分钟测出我的相处模式，结果有点上头',
      '本来想随便点一下，结果看完沉默了三秒…',
    ],
    again: '再测一次',
    reserve: '预约同频内测',
    reserveDone: '已收到，内测开放时我们会通知你',
    reservePlaceholder: '输入手机号（仅用于内测邀请）',
    reserveAgree: '我同意将上述手机号用于内测邀请联系',
    deleteData: '删除我的数据',
    deleteConfirm: '删除后本次测评记录、预约手机号将永久清除，无法恢复。确定删除？',
    deleteDone: '已删除全部数据',
    deleteFail: '删除失败，请稍后重试',
  },
  disclaimer: '本测评为传统文化视角的自我了解工具，仅供娱乐参考。\n不是心理诊断，不构成婚恋建议，不代表关系成功概率。',
};

const ANIMALS = {
  monkey: { name: '机灵猴', line: '脑子转得比网速快，唯一的 bug 是追着自己尾巴跑。' },
  owl: { name: '熬夜猫头鹰', line: '白天眯眼装高冷，一到夜里精神得像续了三杯奶茶。' },
  seal: { name: '软乎海豹', line: '看着在发呆，其实正忙着给自己挑第 8 个舒服的姿势。' },
  penguin: { name: '蹦迪企鹅', line: '走路一摇三晃自带背景音乐，站着不动都能萌。' },
  sloth: { name: '摆烂树懒', line: '急事到我这儿自动变成已读不回，别催，催了也是 0.5 倍速。' },
  hippo: { name: '戏多河马', line: '表面泡水装佛系，心里的小剧场已经演到第八集大结局。' },
  crocodile: { name: '营业鳄鱼', line: '别看我咧嘴笑，那是营业表情，下班后我比谁都想躺平。' },
  octopus: { name: '时间管理章鱼', line: '八条腿同时忙，还能抽一条给你比心，时间管理大师本人。' },
};

const ANIMAL_BANDS = [
  { min: 80, max: 99, ids: ['monkey', 'owl'] },
  { min: 60, max: 79, ids: ['seal', 'penguin'] },
  { min: 40, max: 59, ids: ['sloth', 'hippo'] },
  { min: 1, max: 39, ids: ['crocodile', 'octopus'] },
];

function pickAnimal(resonance, random) {
  const rnd = random || Math.random;
  const band = ANIMAL_BANDS.find((b) => resonance >= b.min && resonance <= b.max) || ANIMAL_BANDS[ANIMAL_BANDS.length - 1];
  const index = Math.min(band.ids.length - 1, Math.floor(rnd() * band.ids.length));
  const id = band.ids[index];
  return { id, name: ANIMALS[id].name, line: ANIMALS[id].line };
}

function pickHook(animal, resonance, random) {
  const rnd = random || Math.random;
  const i = Math.min(COPY.result.hooks.length - 1, Math.floor(rnd() * COPY.result.hooks.length));
  return COPY.result.hooks[i].replace('{animal}', animal.name).replace('{resonance}', resonance);
}

module.exports = { COPY, ANIMALS, pickAnimal, pickHook };
