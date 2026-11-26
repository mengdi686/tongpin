// 同频 · 阶段0 结果卡动物配置
// 纯视觉趣味：动物与分数段的映射没有性格含义，不参与计分、不进入推荐排序。
// 素材：CocoMaterial CC0 公有领域，本地 SVG，无外链、无署名要求。

export const ANIMALS = {
  monkey: { name: '机灵猴', file: 'animals_monkey_1.svg', line: '一只停不下来的猴子，点子多到手机都装不下。' },
  owl: { name: '夜猫子头鹰', file: 'animals_bird_owl.svg', line: '夜里最清醒的那只，白天主打一个随缘。' },
  seal: { name: '软乎海豹', file: 'animals_seal_baby.svg', line: '看着在发呆，其实在挑最舒服的姿势。' },
  penguin: { name: '慢热企鹅', file: 'animals_bird_penguin_03.svg', line: '站着不动也能萌，认准了就不换位置。' },
  sloth: { name: '淡定树懒', file: 'animals_mamals_bear_sloth_01.svg', line: '急事到我这儿自动降级成小事，别催，催也没用。' },
  hippo: { name: '戏多河马', file: 'animal_bulky_hippo.svg', line: '泡在水里装淡定，其实内心戏比谁都多。' },
  crocodile: { name: '微笑鳄鱼', file: 'animals_crocodile_alligator.svg', line: '别看我在笑，我只是懒得动，心里门儿清。' },
  octopus: { name: '八爪章鱼', file: 'animals_octopus.svg', line: '八条腿同时忙，还能抽出一条给你比心。' },
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
