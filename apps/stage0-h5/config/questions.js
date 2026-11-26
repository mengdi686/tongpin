// 同频 · 阶段0 题目配置
// L1: IPIP 公有领域题库子集（6 维 × 2 题），依恋维度为自编题，不复现 ECR-R 原题
// L2: 关系内变量自编题，取自 PNAS 2020 高预测变量

export const L1_QUESTIONS = [
  { id: 'n1', dim: 'neuroticism', reverse: false, text: '我常常担心事情会出错。' },
  { id: 'n2', dim: 'neuroticism', reverse: true, text: '我通常能平静面对生活中的变化。' },
  { id: 'e1', dim: 'extraversion', reverse: false, text: '我喜欢和人聊天，聚会后觉得充电了。' },
  { id: 'e2', dim: 'extraversion', reverse: true, text: '我更喜欢一个人待着，社交让我疲惫。' },
  { id: 'o1', dim: 'openness', reverse: false, text: '我喜欢尝试没接触过的东西。' },
  { id: 'o2', dim: 'openness', reverse: true, text: '我更愿意按熟悉的方式来。' },
  { id: 'a1', dim: 'agreeableness', reverse: false, text: '我很容易体谅别人的处境。' },
  { id: 'a2', dim: 'agreeableness', reverse: true, text: '别人犯错时我很难不在意。' },
  { id: 'c1', dim: 'conscientiousness', reverse: false, text: '答应的事我会尽力做到。' },
  { id: 'c2', dim: 'conscientiousness', reverse: true, text: '我经常拖到最后才动手。' },
  { id: 's1', dim: 'attachment', reverse: false, text: '关系变近时，我会想确认对方还在意我。' },
  { id: 's2', dim: 'attachment', reverse: true, text: '即使对方没及时回复，我也不会多想。' },
];

export const L2_QUESTIONS = [
  { id: 'r1', dim: 'commitment', reverse: false, text: '我希望对方能明确表达「我们是认真的」。' },
  { id: 'r2', dim: 'commitment', reverse: false, text: '一段关系里，我更看重稳定而不是新鲜感。' },
  { id: 'r3', dim: 'appreciation', reverse: false, text: '我需要对方具体说出欣赏我的地方。' },
  { id: 'r4', dim: 'appreciation', reverse: false, text: '被对方认真倾听，比送礼物更让我开心。' },
  { id: 'r5', dim: 'conflict', reverse: false, text: '有分歧时，我会先冷静下来再谈。' },
  { id: 'r6', dim: 'conflict', reverse: false, text: '我愿意在争吵后主动说「我们聊聊」。' },
  { id: 'r7', dim: 'rhythm', reverse: false, text: '我希望两个人既有共处时间，也各有空间。' },
  { id: 'r8', dim: 'rhythm', reverse: false, text: '我不喜欢关系推进得太快。' },
];

export const DIM_LABELS = {
  neuroticism: '情绪敏感',
  extraversion: '外向热情',
  openness: '开放好奇',
  agreeableness: '温和体谅',
  conscientiousness: '踏实可靠',
  attachment: '关系确认',
};

// 风格词库：每个维度按高低取不同描述，均为倾向性表述，不贴标签
export const STYLE_WORDS = {
  neuroticism: { high: '感受细腻', low: '情绪稳定' },
  extraversion: { high: '外向热络', low: '安静自洽' },
  openness: { high: '开放好奇', low: '踏实务实' },
  agreeableness: { high: '温和体谅', low: '独立主见' },
  conscientiousness: { high: '踏实可靠', low: '随性自在' },
  attachment: { high: '重视确认', low: '从容信任' },
};

// 关系层四个维度的短标题
export const CARE_MAP = {
  commitment: '明确的关系定位',
  appreciation: '被具体地看见',
  conflict: '冷静后的沟通',
  rhythm: '有呼吸感的节奏',
};

// 每个维度按高低分给两条具体描述：高低都能"说到心里"，避免只报抽象标签
export const CARE_DETAILS = {
  commitment: {
    high: '你希望对方把「认真」说出口，含糊不明的状态会让你一直悬着心。',
    low: '你更相信相处本身，不想被过早定义，行动比表态更能让你安心。',
  },
  appreciation: {
    high: '你在意对方说出「为什么喜欢你」，一句笼统的好，不如记住你说过的小事。',
    low: '你不太需要被频繁夸赞，舒服自在地待在一起，对你来说更实在。',
  },
  conflict: {
    high: '有分歧时你需要一点缓冲，先冷静下来，才说得出真正想说的话。',
    low: '你宁可当下把话说清，也不愿意让问题过夜、在心里反复打转。',
  },
  rhythm: {
    high: '亲密和独处你都要有，黏得太紧会累，留出空间反而更想靠近。',
    low: '你不太刻意计算空间，顺着感觉走、自然合拍，比安排节奏更舒服。',
  },
};

// 固定模板建议库，按最高关系维度选取
export const ADVICE_MAP = {
  commitment: '可以直接告诉对方你重视明确的关系定位，不必等对方猜。',
  appreciation: '把你希望被欣赏的具体行为说出来，比如「记得我说过的小事」。',
  conflict: '约定一个「冷静 20 分钟再聊」的共识，会让你更安心。',
  rhythm: '坦白说出你需要的独处时间，并给出你回来的具体时间。',
};

export const QUESTIONS = [...L1_QUESTIONS, ...L2_QUESTIONS];
