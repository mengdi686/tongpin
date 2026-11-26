// 同频 · 阶段0 结果卡动物配置
// 纯视觉趣味：动物与分数段的映射没有性格含义，不参与计分、不进入推荐排序。
// 素材：CocoMaterial CC0 公有领域，本地 SVG，无外链、无署名要求。

export const ANIMALS = {
  monkey: { name: '机灵猴', file: 'animals_monkey_1.svg', line: '脑子转得比网速快，唯一的 bug 是追着自己尾巴跑。' },
  owl: { name: '熬夜猫头鹰', file: 'animals_bird_owl.svg', line: '白天眯眼装高冷，一到夜里精神得像续了三杯奶茶。' },
  seal: { name: '软乎海豹', file: 'animals_seal_baby.svg', line: '看着在发呆，其实正忙着给自己挑第 8 个舒服的姿势。' },
  penguin: { name: '蹦迪企鹅', file: 'animals_bird_penguin_03.svg', line: '走路一摇三晃自带背景音乐，站着不动都能萌。' },
  sloth: { name: '摆烂树懒', file: 'animals_mamals_bear_sloth_01.svg', line: '急事到我这儿自动变成已读不回，别催，催了也是 0.5 倍速。' },
  hippo: { name: '戏多河马', file: 'animal_bulky_hippo.svg', line: '表面泡水装佛系，心里的小剧场已经演到第八集大结局。' },
  crocodile: { name: '营业鳄鱼', file: 'animals_crocodile_alligator.svg', line: '别看我咧嘴笑，那是营业表情，下班后我比谁都想躺平。' },
  octopus: { name: '时间管理章鱼', file: 'animals_octopus.svg', line: '八条腿同时忙，还能抽一条给你比心，时间管理大师本人。' },
};

// 4 个分数段，每段 2 种动物，段内随机：同一分数重测可能换一只，增加再来一次的趣味。
export const ANIMAL_BANDS = [
  { min: 80, max: 99, ids: ['monkey', 'owl'] },
  { min: 60, max: 79, ids: ['seal', 'penguin'] },
  { min: 40, max: 59, ids: ['sloth', 'hippo'] },
  { min: 1, max: 39, ids: ['crocodile', 'octopus'] },
];

export const animalIds = () => Object.keys(ANIMALS);

// random 可注入，便于测试断言段位合法性（不依赖具体随机结果）
export function bandFor(resonance) {
  return ANIMAL_BANDS.find((b) => resonance >= b.min && resonance <= b.max) || ANIMAL_BANDS[ANIMAL_BANDS.length - 1];
}

export function pickAnimal(resonance, random = Math.random) {
  const band = bandFor(resonance);
  const index = Math.min(band.ids.length - 1, Math.floor(random() * band.ids.length));
  const id = band.ids[index];
  return { id, ...ANIMALS[id], band: `${band.min}-${band.max}` };
}
