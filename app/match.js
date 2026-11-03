/* 牵手 App 匹配页 · 视觉与交互复刻（纯前端原型，数据为虚构） */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const PEOPLE = [
  {
    id: 'jiajia', name: '刘佳佳', age: 27, city: '上海 · 徐汇', dist: '距你 3.2km',
    photo: 'assets/match/liujiajia.jpg', score: 96,
    hot: ['浙江大学', '每年带家人旅行', '乐天派'],
    tags: ['UI 设计师', '爱养花', '周末看展', '普拉提'],
    bio: '爱运动，也爱在周末逛展。希望有人一起，把普通的日子过得有意思。',
    about: '杭州读完大学，来上海第五年。工作忙，但生活不将就：下班去滨江跑步，周末下厨或看展。',
    facts: [['ruler', '165cm'], ['star', '双子座'], ['school', '浙江大学 · 本科'], ['job', '互联网 · UI 设计师']],
    interests: ['摄影', '当代艺术', '普拉提', '咖啡', '旅行'],
    tests: [['恋爱人格', '可靠的陪伴者'], ['情绪稳定', '偏高'], ['冲突处理', '先冷静，再沟通']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: true
  },
  {
    id: 'chenyu', name: '陈屿', age: 30, city: '上海 · 静安', dist: '距你 5.8km',
    photo: 'assets/match/chenyu.jpg', score: 93,
    hot: ['同济大学', '会做饭', '喜欢逛展'],
    tags: ['建筑设计师', '跑步', '黑胶', '咖啡'],
    bio: '比起热闹，更想和喜欢的人安静地吃一顿晚饭，再散一段路。',
    about: '做建筑设计第七年，习惯把细节想清楚。周末会跑步、逛展，偶尔在家研究一道新菜。',
    facts: [['ruler', '180cm'], ['star', '摩羯座'], ['school', '同济大学 · 硕士'], ['job', '建筑设计师']],
    interests: ['建筑', '摄影', '徒步', '咖啡', '黑胶'],
    tests: [['恋爱人格', '稳重的建设者'], ['情绪稳定', '高'], ['冲突处理', '先听完，再表达']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: true
  },
  {
    id: 'linwan', name: '林晚', age: 26, city: '上海 · 长宁', dist: '距你 4.6km',
    photo: 'assets/match/linwan.jpg', score: 91,
    hot: ['上海师范大学', '会弹钢琴', '声音好听'],
    tags: ['音乐老师', '喜欢猫', '手冲咖啡', '看话剧'],
    bio: '生活里大部分快乐，来自音乐和猫。想找一个能一起听现场的人。',
    about: '教小朋友唱歌的第五年。下班后会练琴、做饭，周末去听一场演出，或逛很久书店。',
    facts: [['ruler', '162cm'], ['star', '巨蟹座'], ['school', '上海师范大学 · 本科'], ['job', '小学音乐老师']],
    interests: ['钢琴', '话剧', '猫', '手冲咖啡', '民谣'],
    tests: [['恋爱人格', '温柔的照顾者'], ['情绪稳定', '中高'], ['冲突处理', '需要一点时间消化']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: true
  },
  {
    id: 'zhouye', name: '周野', age: 28, city: '上海 · 浦东', dist: '距你 9.1km',
    photo: 'assets/match/zhouye.jpg', score: 88,
    hot: ['华东师范大学', '每周爬山', '会拍照'],
    tags: ['产品经理', '露营', '自驾', '纪录片'],
    bio: '周末基本在山里。希望下次出发，副驾有人。',
    about: '白天做产品，晚上研究路线。每年会留两次长假去远一点的地方，平时周末在江浙徒步。',
    facts: [['ruler', '178cm'], ['star', '射手座'], ['school', '华东师范大学 · 本科'], ['job', '互联网 · 产品经理']],
    interests: ['徒步', '露营', '自驾', '纪录片', '咖啡'],
    tests: [['恋爱人格', '自由的同行者'], ['情绪稳定', '中'], ['冲突处理', '直说，不绕弯']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: false, match: false
  },
  {
    id: 'suqing', name: '苏晴', age: 29, city: '上海 · 黄浦', dist: '距你 2.4km',
    photo: 'assets/match/suqing.jpg', score: 85,
    hot: ['复旦大学', '爱看书', '情绪稳定'],
    tags: ['医生', '手冲咖啡', '逛菜场', '看话剧'],
    bio: '工作之外，想把时间留给值得的人。',
    about: '在医院工作，节奏快，所以更珍惜慢下来的时刻。喜欢逛菜场、做饭，也喜欢安静地读完一本书。',
    facts: [['ruler', '168cm'], ['star', '天秤座'], ['school', '复旦大学 · 博士'], ['job', '三甲医院 · 内科医生']],
    interests: ['文学', '手冲咖啡', '做饭', '话剧', '游泳'],
    tests: [['恋爱人格', '稳定的倾听者'], ['情绪稳定', '高'], ['冲突处理', '先讲事实，再讲感受']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: true
  }
];

/* ---------- 性别 + 生辰八字（原型数据） ---------- */
const EXTRA = {
  jiajia: { gender: 'f', bazi: { score: 96, zheng: true, tags: ['日主相生', '夫妻宫合', '用神互补'], text: '你的日主与 TA 相生，夫妻宫相合。相处里少了消耗，多了互相托底。' } },
  chenyu: { gender: 'm', bazi: { score: 90, zheng: false, tags: ['夫妻宫半合', '五行偏木'], text: '你们的夫妻宫有半合，节奏偏稳，适合慢慢相处。' } },
  linwan: { gender: 'f', bazi: { score: 93, zheng: true, tags: ['夫妻宫合', '食伤相悦', '用神互补'], text: 'TA 的食伤正好补你的用神，聊得来越处越顺，是偏正缘的组合。' } },
  zhouye: { gender: 'm', bazi: { score: 76, zheng: false, tags: ['日支相冲', '五行偏火'], text: '你们日支相冲，短期吸引力强，长期需要更多磨合。' } },
  suqing: { gender: 'f', bazi: { score: 84, zheng: false, tags: ['夫妻宫平', '五行偏水'], text: '合盘平稳，没有明显冲克，更多靠相处慢慢养出来。' } }
};
PEOPLE.forEach(p => Object.assign(p, EXTRA[p.id] || {}));

PEOPLE.push(
  {
    id: 'pool_m1', name: '陆时安', age: 29, gender: 'm', city: '上海 · 徐汇', dist: '距你 1.8km',
    photo: 'assets/match/pool_m1.jpg', score: 94,
    hot: ['华东政法大学', '会做饭', '情绪稳定'],
    tags: ['律师', '手冲咖啡', '网球', '逛书店'],
    bio: '比起热闹，我更想和一个人把日子过得稳一点。',
    about: '做商事律师第六年。工作里要严谨，生活里反而喜欢慢一点：周末做饭、打球，偶尔去书店待一下午。',
    facts: [['ruler', '182cm'], ['star', '天秤座'], ['school', '华东政法大学 · 硕士'], ['job', '律师事务所 · 律师']],
    interests: ['网球', '手冲咖啡', '法律史', '做饭', '城市散步'],
    tests: [['恋爱人格', '稳重的守护者'], ['情绪稳定', '高'], ['冲突处理', '先听完，再说立场']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: false,
    bazi: { score: 95, zheng: true, tags: ['日主相生', '夫妻宫合', '用神互补'], text: '你的日主与 TA 相生，夫妻宫相合。相处里少了消耗，多了互相托底。' },
    dims: { cog: 95, int: 88, face: 93 },
    ai: '同频点：都把「稳定」当成一种浪漫。TA 说得少，但会提前把事安排好。',
    openers: ['你办案子的时候，会紧张吗？', '你最近在书店淘到什么好书？', '周末打球，你一般去哪片场？'],
    replies: ['听起来就很稳，跟你聊天很安心。', '下次打球可以叫我。', '这道菜你是跟谁学的？'],
    auto: ['好啊，周末我正好有空。', '你这么说，我有点被戳到。', '那下次我做饭，你来尝尝。']
  },
  {
    id: 'pool_m2', name: '程野', age: 31, gender: 'm', city: '上海 · 青浦', dist: '距你 12.6km',
    photo: 'assets/match/pool_m2.jpg', score: 88,
    hot: ['同济大学', '走过滇藏线', '会修装备'],
    tags: ['户外领队', '露营', '吉他', '狗'],
    bio: '常年在路上，但更想有个固定的家。',
    about: '带户外团第七年，走过滇藏线。看起来野，其实生活很规律：早睡、做饭、每周给家里打电话。',
    facts: [['ruler', '181cm'], ['star', '白羊座'], ['school', '同济大学 · 本科'], ['job', '户外俱乐部 · 领队']],
    interests: ['徒步', '露营', '吉他', '狗', '自驾'],
    tests: [['恋爱人格', '自由的同行者'], ['情绪稳定', '中高'], ['冲突处理', '先出发，路上再聊']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: false, match: false,
    bazi: { score: 83, zheng: false, tags: ['日支半合', '五行偏木'], text: '你们有半合，也有一点冲，适合先从一起出门开始。' },
    dims: { cog: 84, int: 96, face: 85 },
    ai: '同频点：都把「出去走走」当解压方式。TA 行动力强，你需要有人推一把。',
    openers: ['你带团最难忘的一次是哪次？', '露营新手第一件该买什么？', '你家狗叫什么名字？'],
    replies: ['听起来就很自由。', '下次出发可以带上我吗？', '我体力一般，能跟上吗？'],
    auto: ['哈哈，那说定了。', '我下周有空，一起去？', '你愿意出门就很好。']
  },
  {
    id: 'pool_m3', name: '周牧', age: 28, gender: 'm', city: '上海 · 虹口', dist: '距你 8.3km',
    photo: 'assets/match/pool_m3.jpg', score: 87,
    hot: ['上海音乐学院', '组过乐队', '声音好听'],
    tags: ['音乐制作人', '黑胶', '滑板', '猫'],
    bio: '白天做音乐，晚上写歌，想找个人一起听现场。',
    about: '做编曲第五年，给几个独立乐队做专辑。作息不太规律，但只要答应的事一定做到。',
    facts: [['ruler', '176cm'], ['star', '水瓶座'], ['school', '上海音乐学院 · 本科'], ['job', '独立音乐制作人']],
    interests: ['黑胶', '现场演出', '滑板', '猫', '电影'],
    tests: [['恋爱人格', '敏感的创作者'], ['情绪稳定', '中'], ['冲突处理', '先写下来，再说']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: false,
    bazi: { score: 89, zheng: false, tags: ['夫妻宫合', '食伤相生'], text: '你们的夫妻宫相合，情绪频率接近，适合从共同喜欢的声音开始。' },
    dims: { cog: 82, int: 95, face: 84 },
    ai: '同频点：都被「好听」打动。TA 慢热，需要一个愿意先开口的人。',
    openers: ['你最近做的一首歌，叫什么？', '黑胶里你最舍不得的是哪张？', '你家猫会踩你的琴键吗？'],
    replies: ['这首歌我去听听看。', '感觉你很有自己的想法。', '下次有演出可以叫我一起。'],
    auto: ['那我发你 demo～', '被你这么一说，今天状态都好了。', '周末有场演出，要去吗？']
  },
  {
    id: 'pool_m4', name: '顾言', age: 33, gender: 'm', city: '上海 · 张江', dist: '距你 10.4km',
    photo: 'assets/match/pool_m4.jpg', score: 86,
    hot: ['上海交通大学', '作息规律', '喜欢小孩'],
    tags: ['芯片工程师', '做饭', '游泳', '纪录片'],
    bio: '生活简单，想把稳定的日子分一半给你。',
    about: '做芯片设计第九年，生活两点一线但不无聊。周末游泳、做饭、看纪录片，很少熬夜。',
    facts: [['ruler', '178cm'], ['star', '金牛座'], ['school', '上海交通大学 · 硕士'], ['job', '半导体 · 芯片工程师']],
    interests: ['游泳', '做饭', '纪录片', '园艺', '围棋'],
    tests: [['恋爱人格', '可靠的陪伴者'], ['情绪稳定', '高'], ['冲突处理', '先解决问题，再谈情绪']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: false, match: false,
    bazi: { score: 92, zheng: true, tags: ['夫妻宫合', '用神互补', '日主相生'], text: '你们的合盘是少见的「互相补位」：TA 稳你，你暖 TA，适合长期。' },
    dims: { cog: 93, int: 79, face: 82 },
    ai: '同频点：都想要稳定的长期关系。TA 不擅长表达，但行动很实在。',
    openers: ['你最近在做什么菜？', '周末游泳去哪个馆？', '有部纪录片你最近看完的吗？'],
    replies: ['感觉很踏实。', '下次做饭可以叫上我。', '我也喜欢这种安静的日子。'],
    auto: ['好啊，我周末一般都在家。', '你说得我都想试试。', '那下次一起吃个饭？']
  },
  {
    id: 'pool_f1', name: '沈知微', age: 26, gender: 'f', city: '上海 · 杨浦', dist: '距你 6.1km',
    photo: 'assets/match/pool_f1.jpg', score: 92,
    hot: ['中国美术学院', '会画画', '爱笑'],
    tags: ['美术老师', '看展', '骑行', '养多肉'],
    bio: '教小朋友画画，也认真过自己的小日子。',
    about: '在小学教美术第四年。周末不是看展，就是骑车在城市里乱逛。喜欢一切有颜色的事。',
    facts: [['ruler', '166cm'], ['star', '狮子座'], ['school', '中国美术学院 · 本科'], ['job', '小学美术老师']],
    interests: ['绘画', '展览', '骑行', '多肉', '拍立得'],
    tests: [['恋爱人格', '明亮的陪伴者'], ['情绪稳定', '中高'], ['冲突处理', '当场说清楚']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: true,
    bazi: { score: 88, zheng: false, tags: ['夫妻宫半合', '五行偏火'], text: '合盘偏亮，相处起来轻松，长期要看能不能一起慢下来。' },
    dims: { cog: 86, int: 94, face: 95 },
    ai: '同频点：都对生活有颜色上的要求。TA 直接，你不需要猜。',
    openers: ['你最近看的展，哪个最值得去？', '教小朋友画画最开心的是什么？', '你的多肉养了多久了？'],
    replies: ['听起来就很明亮。', '下次看展可以一起。', '我也喜欢这种有颜色的生活。'],
    auto: ['好呀，周末正好有展。', '你这么说我有点开心。', '那下次一起骑车？']
  },
  {
    id: 'pool_f2', name: '顾清和', age: 30, gender: 'f', city: '上海 · 静安', dist: '距你 5.4km',
    photo: 'assets/match/pool_f2.jpg', score: 90,
    hot: ['复旦大学', '策展人', '说话温柔'],
    tags: ['画廊策展', '古典乐', '手冲咖啡', '游泳'],
    bio: '工作围绕艺术，生活希望简单一点。',
    about: '在画廊做策展第六年。看过很多热闹，反而更珍惜安静的晚饭和一场不赶时间的对话。',
    facts: [['ruler', '169cm'], ['star', '双鱼座'], ['school', '复旦大学 · 硕士'], ['job', '画廊 · 策展人']],
    interests: ['当代艺术', '古典乐', '手冲咖啡', '游泳', '旅行'],
    tests: [['恋爱人格', '温柔的倾听者'], ['情绪稳定', '高'], ['冲突处理', '先理解，再表达']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: false, match: false,
    bazi: { score: 80, zheng: false, tags: ['夫妻宫平', '五行偏水'], text: '合盘不冲不克，更多是靠共同话题慢慢靠近。' },
    dims: { cog: 92, int: 88, face: 90 },
    ai: '同频点：都愿意认真听对方说话。TA 慢热，但一旦打开会很真诚。',
    openers: ['你最近策划的展是什么主题？', '古典乐里你最爱哪一首？', '工作这么忙，你怎么让自己放松？'],
    replies: ['这个话题我很想听你多说一点。', '感觉你生活里有自己的秩序。', '下次有展可以叫我。'],
    auto: ['好啊，我最近正好有场新展。', '你也喜欢艺术吗？', '那我们约个安静的下午聊聊？']
  },
  {
    id: 'pool_f3', name: '唐笑笑', age: 27, gender: 'f', city: '上海 · 普陀', dist: '距你 7.2km',
    photo: 'assets/match/pool_f3.jpg', score: 91,
    hot: ['南京大学', '一年读 40 本', '爱做饭'],
    tags: ['图书编辑', '书店', '做饭', '养猫'],
    bio: '把日子过成一本慢慢读的书。',
    about: '做图书编辑第五年。下班喜欢逛书店、做饭，周末会给自己留一个完全不安排下午。',
    facts: [['ruler', '163cm'], ['star', '处女座'], ['school', '南京大学 · 本科'], ['job', '出版社 · 图书编辑']],
    interests: ['文学', '书店', '做饭', '猫', '爵士乐'],
    tests: [['恋爱人格', '安静的照顾者'], ['情绪稳定', '中高'], ['冲突处理', '先消化，再沟通']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: true, match: true,
    bazi: { score: 94, zheng: true, tags: ['日主相生', '夫妻宫合', '食伤相悦'], text: '你们的日主相生，夫妻宫相合。TA 的安静正好接住你的节奏，是偏正缘的组合。' },
    dims: { cog: 96, int: 90, face: 87 },
    ai: '同频点：都在意「日常感」。TA 不抢话，但会记得你说过的小事。',
    openers: ['你最近编的书叫什么？', '一年读 40 本，是怎么做到的？', '你家猫会打扰你做饭吗？'],
    replies: ['听起来就很舒服。', '这本书我想找来看看。', '下次可以一起逛书店。'],
    auto: ['好啊，我知道一家很安静的书店。', '你这么说我有点不好意思。', '周末我正好有空。']
  },
  {
    id: 'pool_f4', name: '江晚晴', age: 24, gender: 'f', city: '上海 · 闵行', dist: '距你 9.8km',
    photo: 'assets/match/pool_f4.jpg', score: 86,
    hot: ['上海财经大学', '会做甜品', '性格甜'],
    tags: ['甜品师', '烘焙', '跑步', '看日落'],
    bio: '想把每一个普通下午，都做成甜的。',
    about: '开了一家小店做甜品第二年。每天起得早，收店后去跑步或看日落。希望有人一起吃饭。',
    facts: [['ruler', '160cm'], ['star', '巨蟹座'], ['school', '上海财经大学 · 本科'], ['job', '自营甜品店 · 主理人']],
    interests: ['烘焙', '跑步', '日落', '咖啡', '小狗'],
    tests: [['恋爱人格', '温暖的照顾者'], ['情绪稳定', '中'], ['冲突处理', '先难过一会，再聊']],
    verified: [['实名认证', '身份证认证'], ['真实头像认证', '人脸比对'], ['学历认证', '学信网认证']],
    likesYou: false, match: false,
    bazi: { score: 86, zheng: false, tags: ['夫妻宫半合', '五行偏土'], text: '你们有半合，互补的是生活感，需要多给彼此一点确定感。' },
    dims: { cog: 80, int: 92, face: 96 },
    ai: '同频点：都愿意为日常花心思。TA 情绪来得快，需要被稳稳接住。',
    openers: ['你的店招牌是哪一款？', '做甜品最难的是什么？', '你一般去哪看日落？'],
    replies: ['听起来就好甜。', '下次去你店里尝尝。', '我也喜欢看日落。'],
    auto: ['那给你留一块～', '你说话让人很安心。', '周末收店早，可以一起走走。']
  }
);

/* ---------- 三维匹配 + AI 文案（原型数据） ---------- */
const META = {
  jiajia: {
    dims: { cog: 94, int: 97, face: 98 },
    ai: '同频点：都把周末当生活，而不是补觉。差异在节奏——TA 更松弛，你更爱计划。',
    openers: ['你最近看的展里，哪个最值得去？', '照片里的花是你养的吗？我总养不活。', '周末去滨江跑步，几点人少一点？'],
    replies: ['听起来就很舒服，下次可以一起。', '我刚好也想去，要不要约个周末？', '这个我不太懂，你给我讲讲？'],
    auto: ['好呀，那我们约个周末～', '哈哈，被你说得有点心动。', '我周末一般都有空，你定时间。']
  },
  chenyu: {
    dims: { cog: 95, int: 88, face: 96 },
    ai: '同频点：都相信细节里见真心。TA 表达慢，但答应的事都会做到。',
    openers: ['你做的建筑里，哪个最想带人去看？', '你说会研究新菜，最近在试什么？', '黑胶里你最爱的一张是哪张？'],
    replies: ['这个听起来很有意思，展开说说？', '下次做菜可以叫上我。', '我也喜欢这种慢慢来的感觉。'],
    auto: ['好啊，我周末正好有空。', '你这么说，我有点开心。', '那下次一起吃个饭？']
  },
  linwan: {
    dims: { cog: 89, int: 96, face: 88 },
    ai: '同频点：你们都需要被声音和情绪照顾。TA 慢热，熟了会很黏。',
    openers: ['你最近在听哪首歌？', '教小朋友唱歌，最开心的是什么？', '你家猫叫什么名字？'],
    replies: ['这首歌我去听听看。', '感觉你很会照顾人。', '下次有演出可以叫我一起。'],
    auto: ['那我发你歌单～', '被你这么一说，今天心情都好了。', '周末有场演出，要去吗？']
  },
  zhouye: {
    dims: { cog: 90, int: 92, face: 81 },
    ai: '同频点：你们都愿意为喜欢的事留时间。差异在规划——TA 更即兴。',
    openers: ['你最近走的那条线，难度大吗？', '露营装备你最推荐哪一件？', '自驾的话，你更喜欢海边还是山里？'],
    replies: ['听起来就很自由。', '下次出发可以带上我吗？', '我也想试试，难不难上手？'],
    auto: ['哈哈，那说定了。', '我下周有空，一起去？', '你也喜欢户外吗？']
  },
  suqing: {
    dims: { cog: 91, int: 80, face: 84 },
    ai: '同频点：都珍惜慢下来的时刻。TA 情绪稳定，适合长久相处。',
    openers: ['在医院这么忙，你怎么让自己放松？', '你最近在读什么书？', '逛菜场对你来说是放松吗？'],
    replies: ['听起来你把自己的生活照顾得很好。', '我也想学着慢下来。', '那本书可以借我吗？'],
    auto: ['嗯，慢慢来就好。', '你也有相似的感受吗？', '周末我一般会做顿饭，欢迎来蹭。']
  }
};
PEOPLE.forEach(p => Object.assign(p, META[p.id] || {}));

const PREF_TAGS = ['生活丰富', '圈子简单', '工作生活平衡', '恋爱小白', '生活规律', '自律', '有生活气息', '喜欢宅家', '旅行', '吃货', '情绪稳定', '爱运动'];
const PREF_SIZES = ['b2', 'b3', 'b1', 'b3', 'b2', 'b1', 'b2', 'b3', 'b1', 'b1', 'b2', 'b3'];

/* ---------- 籍贯 / 当前位置（原型数据） ---------- */
const ORIGINS = {
  jiajia: '浙江 · 杭州', chenyu: '江苏 · 南京', linwan: '上海 · 本地', zhouye: '安徽 · 合肥', suqing: '江苏 · 苏州',
  pool_m1: '浙江 · 宁波', pool_m2: '四川 · 成都', pool_m3: '湖南 · 长沙', pool_m4: '山东 · 青岛',
  pool_f1: '福建 · 厦门', pool_f2: '湖北 · 武汉', pool_f3: '陕西 · 西安', pool_f4: '广东 · 汕头'
};
PEOPLE.forEach(p => {
  p.origin = ORIGINS[p.id] || '上海 · 本地';
  p.ipCity = p.city.split(' · ')[0];
});

const FILTERS = [
  { k: '年龄', opts: ['22–26', '27–30', '31–35', '不限'] },
  { k: '身高', opts: ['155+', '165+', '175+', '不限'] },
  { k: '学历', opts: ['本科及以上', '硕士及以上', '不限'] },
  { k: '当前位置', opts: ['上海', '杭州', '苏州', '不限'] },
  { k: '认证', opts: ['实名 + 真人', '学历认证', '不限'] }
];

const ICONS = {
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15L15 4l5 5L9 20z"/><path d="M8 11l2 2M11 8l2 2M14 5l2 2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.6l2.5 5.3 5.7.7-4.2 4 1.1 5.7-5.1-2.8-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z"/></svg>',
  school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5z"/><path d="M7 12v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4"/></svg>',
  job: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 16l.7 1.8L20.5 18l-1.8.7L18 20.5l-.7-1.8L15.5 18l1.8-.7z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21z"/><circle cx="12" cy="10.6" r="2.2"/></svg>'
};
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

const state = {
  i: 0,
  prefs: new Set(['圈子简单', '有生活气息', '情绪稳定']),
  vip: false,
  zheng: false,
  zhengPaid: false,
  busy: false,
  flowerCount: 0,
  matched: false,
  matchId: null,
  chats: [],
  chatId: null,
  sugOffset: 0,
  profile: null,
  onboard: null,
  liked: [],
  points: 0,
  myCard: null,
  rewardClaimed: false
};
let onbWizardBack = false;

/* ---------- 性别与推荐池 ---------- */
const myGender = () => (state.onboard && state.onboard.gender) || 'm';
const oppGender = () => (myGender() === 'm' ? 'f' : 'm');
const isOpp = p => p && p.gender === oppGender();
const visiblePool = () => {
  let pool = PEOPLE.filter(isOpp);
  if (state.zheng) pool = pool.filter(p => p.bazi && p.bazi.zheng);
  return pool;
};
const likesForMe = () => PEOPLE.filter(p => isOpp(p) && p.likesYou);
const zhengLikes = () => likesForMe().filter(p => p.bazi && p.bazi.zheng);
const viewsCount = () => 12 + likesForMe().length * 3 + (myGender() === 'f' ? 2 : 6);

function seedChats(gender) {
  const opp = gender === 'm' ? 'f' : 'm';
  state.chats = JSON.parse(JSON.stringify(CHATS_SEED)).filter(c => {
    const p = PEOPLE.find(x => x.id === c.id);
    return p && p.gender === opp;
  });
  state.chatId = null;
}

function seedLiked() {
  const opp = oppGender();
  const ids = PEOPLE.filter(p => p.gender === opp && !p.likesYou).slice(0, 2).map(p => p.id);
  state.liked = ids;
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- 初始会话 ---------- */
const CHATS_SEED = [
  {
    id: 'jiajia', unread: 2,
    msgs: [
      { from: 'them', text: '你好呀，看到你也喜欢逛展，最近有推荐的吗？', t: '19:52' },
      { from: 'me', text: '上周看了个摄影展，还不错，人不多。', t: '20:03' },
      { from: 'them', text: '叫什么名字？我周末正好有空。', t: '20:06' },
      { from: 'them', text: '顺便问一句，你平时会去滨江跑步吗？', t: '20:14' }
    ]
  },
  {
    id: 'chenyu', unread: 0,
    msgs: [
      { from: 'them', text: '你资料里写「生活不将就」，挺打动我的。', t: '昨天 21:18' },
      { from: 'me', text: '哈哈，主要是工作太忙，怕把生活过没了。', t: '昨天 21:30' },
      { from: 'them', text: '同感。周末吃顿好的，就算给自己充电了。', t: '昨天 21:34' }
    ]
  }
];

/* ---------- 心动画像：照片池与测评题 ---------- */
const FACE_POOL = [
  { id: 'liujiajia', photo: 'assets/match/liujiajia.jpg', face: '鹅蛋脸', vibe: '温柔', gender: 'f' },
  { id: 'chenyu', photo: 'assets/match/chenyu.jpg', face: '立体', vibe: '稳重', gender: 'm' },
  { id: 'linwan', photo: 'assets/match/linwan.jpg', face: '清秀', vibe: '文艺', gender: 'f' },
  { id: 'zhouye', photo: 'assets/match/zhouye.jpg', face: '立体', vibe: '阳光', gender: 'm' },
  { id: 'suqing', photo: 'assets/match/suqing.jpg', face: '鹅蛋脸', vibe: '知性', gender: 'f' },
  { id: 'pool_a', photo: 'assets/match/pool_a.jpg', face: '圆脸', vibe: '清爽', gender: 'f' },
  { id: 'pool_b', photo: 'assets/match/pool_b.jpg', face: '圆脸', vibe: '温和', gender: 'm' },
  { id: 'pool_c', photo: 'assets/match/pool_c.jpg', face: '鹅蛋脸', vibe: '明艳', gender: 'f' },
  { id: 'pool_m1', photo: 'assets/match/pool_m1.jpg', face: '方脸', vibe: '沉稳', gender: 'm' },
  { id: 'pool_m2', photo: 'assets/match/pool_m2.jpg', face: '长脸', vibe: '爽朗', gender: 'm' },
  { id: 'pool_m3', photo: 'assets/match/pool_m3.jpg', face: '瘦长', vibe: '文艺', gender: 'm' },
  { id: 'pool_m4', photo: 'assets/match/pool_m4.jpg', face: '圆脸', vibe: '温和', gender: 'm' },
  { id: 'pool_f1', photo: 'assets/match/pool_f1.jpg', face: '鹅蛋脸', vibe: '明亮', gender: 'f' },
  { id: 'pool_f2', photo: 'assets/match/pool_f2.jpg', face: '鹅蛋脸', vibe: '知性', gender: 'f' },
  { id: 'pool_f3', photo: 'assets/match/pool_f3.jpg', face: '圆脸', vibe: '文艺', gender: 'f' },
  { id: 'pool_f4', photo: 'assets/match/pool_f4.jpg', face: '鹅蛋脸', vibe: '甜美', gender: 'f' }
];

const facePoolFor = () => FACE_POOL.filter(x => x.gender === oppGender());

const SCALE_OPTS = ['完全不像', '不太像', '一半一半', '比较像', '非常像我'];

const WQ = [
  { g: '亲密关系模式', d: 'cog', q: '我希望对方能主动说说自己的想法，而不是让我猜。' },
  { g: '亲密关系模式', d: 'cog', q: '有矛盾时，我希望先冷静一下，再好好聊。' },
  { g: '亲密关系模式', d: 'cog', q: '关系再亲近，我也需要属于自己的时间。' },
  { g: '亲密关系模式', d: 'cog', q: '我更希望两个人一起规划未来，而不是走一步看一步。' },
  { g: '性格底色', d: 'int', q: '我容易被新鲜的事物打动，愿意去尝试。' },
  { g: '性格底色', d: 'int', q: '我更喜欢规律、可预期的生活节奏。' },
  { g: '性格底色', d: 'int', q: '在人群里，我通常是先开口的那个。' },
  { g: '性格底色', d: 'int', q: '周末我更愿意出门走走，而不是待在家里。' },
  { g: '长期关系观', d: 'cog', q: '我看重两个人在金钱和生活习惯上是否合得来。' },
  { g: '长期关系观', d: 'cog', q: '我愿意为了稳定的关系，做出一些让步。' },
  { g: '长期关系观', d: 'cog', q: '我希望日常是平淡踏实的，而不是一直有惊喜。' },
  { g: '长期关系观', d: 'cog', q: '我会把重要的事和对方分享，而不是自己扛。' }
];

/* ---------- card ---------- */
const dimRow = (cls, label, val) => `
  <div class="qs-dim ${cls}">
    <span>${label}</span>
    <i class="qs-dim-track"><b style="width:${val}%"></b></i>
    <em>${val}</em>
  </div>`;

const BAZI_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.4"/><path d="M12 5.2c2.6 3.9 2.6 9.7 0 13.6M5.6 9.2c4.4-1 8.4-1 12.8 0M5.6 14.8c4.4 1 8.4 1 12.8 0"/></svg>';

function baziHTML(p) {
  const b = p.bazi;
  if (!b) return '';
  if (!b.zheng) {
    return `<div class="qs-bazi is-quiet">
      <span class="qb-label">八字合盘参考</span>
      <b class="qb-score">${b.score}</b>
    </div>`;
  }
  return `<div class="qs-zheng-note">
    <div class="zn-head">
      <span class="zn-seal">正缘</span>
      <b>你们互为正缘</b>
    </div>
    <p>${b.text}</p>
    <div class="zn-tags">${b.tags.map(t => `<span>${t}</span>`).join('')}</div>
  </div>`;
}

function cardHTML(p) {
  const hot = p.hot.map(t => `<span class="qs-tag hot">${t}</span>`).join('');
  const tags = p.tags.map(t => `<span class="qs-tag">${t}</span>`).join('');
  const facts = p.facts.map(([ic, tx]) => `<div class="qs-fact">${ICONS[ic]}<b>${tx}</b></div>`).join('');
  const interests = p.interests.map(t => `<span>${t}</span>`).join('');
  const tests = p.tests.map(([k, v]) => `<div class="qs-test"><span>${k}</span><b>${v}</b></div>`).join('');
  const verified = p.verified.map(([t, m]) => `
    <div class="qs-verify">
      <span class="qs-vbadge">${CHECK}</span>
      <p>${t}</p><i>${m}</i>
    </div>`).join('');

  return `
  <article class="qs-card is-in" data-id="${p.id}">
    <div class="qs-photo">
      <img src="${p.photo}" alt="${p.name}的照片" draggable="false" />
      <div class="qs-photo-top">
        ${p.bazi && p.bazi.zheng
          ? '<span class="qs-photo-tag is-zheng">正缘</span>'
          : `<span class="qs-photo-tag">${ICONS.sparkle}每日推荐</span>`}
        <span class="qs-photo-count">${ICONS.pin}${p.dist}</span>
      </div>
      <div class="qs-photo-name">
        <b>${p.name}</b><span>${p.age}</span>
        <span class="qs-vbadge" title="真人认证">${CHECK}</span>
      </div>
    </div>
    <div class="qs-body">
      <div class="qs-tags">
        <span class="qs-tag loc">籍贯 ${p.origin}</span>
        <span class="qs-tag loc">当前 ${p.ipCity}</span>
        ${hot}${tags}
      </div>
      <div class="qs-score">
        <span class="qs-score-dot"></span>
        <span class="qs-score-label">同频契合度<small>认知 · 兴趣 · 眼缘加权</small></span>
        <span class="qs-score-val">${p.score}<em>%</em></span>
      </div>
      ${p.dims ? `<div class="qs-dims">
        ${dimRow('d-cog', '认知同频', p.dims.cog)}
        ${dimRow('d-int', '兴趣同频', p.dims.int)}
        ${dimRow('d-face', '眼缘', p.dims.face)}
      </div>` : ''}
      ${baziHTML(p)}
      ${p.ai ? `<div class="qs-ai-brief">
        <span class="ab-ico">${ICONS.sparkle}</span>
        <p><b>AI 速览 · </b>${p.ai}</p>
      </div>` : ''}
      <p class="qs-bio">${p.bio}</p>

      <div class="qs-sec">
        <h4>基本资料</h4>
        <div class="qs-facts">${facts}</div>
      </div>

      <div class="qs-sec">
        <h4>关于我</h4>
        <p class="qs-about">${p.about}</p>
      </div>

      <div class="qs-sec">
        <h4>兴趣标签</h4>
        <div class="qs-tagcloud">${interests}</div>
      </div>

      <div class="qs-sec">
        <h4>恋爱测评</h4>
        <div class="qs-tests">${tests}</div>
      </div>

      <div class="qs-sec">
        <h4>认证信息</h4>
        <div class="qs-verifies">${verified}</div>
      </div>
    </div>
  </article>`;
}

function renderCard(reset) {
  if (reset) state.i = 0;
  const host = $('#cardHost');
  const done = $('#done');
  const bar = $('#actionbar');
  const plaza = $('#plazaInline');
  const pool = visiblePool();
  if (!pool.length) {
    host.innerHTML = '';
    done.hidden = false;
    bar.hidden = true;
    if (plaza) plaza.hidden = true;
    $('#doneTitle').textContent = state.zheng ? '正缘暂时没有新的了' : '这个条件下暂时没有合适的人';
    $('#doneText').innerHTML = state.zheng
      ? '正缘不是每天都有<br>可以先逛逛其他推荐，或放宽条件'
      : '试着放宽年龄、城市或认证条件<br>我们会继续为你找';
    $('#donePrefs').textContent = '调整筛选条件';
    $('#doneRestart').hidden = true;
    return;
  }
  if (state.i >= pool.length) {
    host.innerHTML = '';
    done.hidden = false;
    bar.hidden = true;
    $('#doneTitle').textContent = state.zheng ? '这批正缘看完啦' : '这一轮看完啦';
    $('#doneText').innerHTML = `推荐不限次数，随时可以继续<br>往下是同频广场，也可以再看看别人`;
    $('#donePrefs').textContent = '调整筛选条件';
    $('#doneRestart').hidden = false;
    if (plaza) { plaza.hidden = false; renderPlaza(); }
    return;
  }
  const p = pool[state.i];
  host.innerHTML = cardHTML(p);
  done.hidden = true;
  bar.hidden = false;
  if (plaza) plaza.hidden = true;
  $('#dailyCount').textContent = '无限';
  bindSwipe(host.querySelector('.qs-card'));
}

/* ---------- swipe ---------- */
function bindSwipe(card) {
  if (!card) return;
  let sx = 0, sy = 0, dx = 0, dy = 0, active = false, horiz = null;

  card.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    active = true; horiz = null; sx = e.clientX; sy = e.clientY; dx = 0; dy = 0;
    card.classList.remove('is-in');
    card.classList.add('is-dragging');
    if (card.setPointerCapture) card.setPointerCapture(e.pointerId);
  });

  card.addEventListener('pointermove', e => {
    if (!active) return;
    dx = e.clientX - sx; dy = e.clientY - sy;
    if (horiz === null) {
      if (Math.abs(dx) > Math.abs(dy) + 6) horiz = true;
      else if (Math.abs(dy) > Math.abs(dx) + 6) { horiz = false; active = false; card.classList.remove('is-dragging'); return; }
      else return;
    }
    if (!horiz) return;
    if (e.cancelable) e.preventDefault();
    card.style.transform = `translate(${dx}px,${dy * 0.12}px) rotate(${dx / 24}deg)`;
    card.style.opacity = String(Math.max(0.55, 1 - Math.abs(dx) / 560));
  });

  const end = () => {
    if (!active) return;
    active = false;
    card.classList.remove('is-dragging');
    if (Math.abs(dx) > 88) { dx > 0 ? like() : pass(); }
    else { card.style.transform = ''; card.style.opacity = ''; }
    dx = 0; dy = 0;
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

/* ---------- actions ---------- */
function flyCard(dir) {
  const card = $('#cardHost .qs-card');
  if (!card) return;
  card.classList.remove('is-in');
  card.style.transform = '';
  card.style.opacity = '';
  void card.offsetWidth;
  card.classList.add(dir === 'like' ? 'fly-right' : 'fly-left');
}

function advance(delay = 330) {
  setTimeout(() => {
    state.i += 1;
    state.busy = false;
    renderCard();
  }, delay);
}

function like() {
  const pool = visiblePool();
  if (state.busy || state.i >= pool.length) return;
  state.busy = true;
  const p = pool[state.i];
  if (!state.liked.includes(p.id)) state.liked.push(p.id);
  flyCard('like');
  advance();
  if (p.match) {
    ensureChat(p);
    renderMsgList();
    if (!state.matched) {
      state.matched = true;
      setTimeout(() => openMatch(p), 560);
    } else {
      toast(`你和 ${p.name} 已经互相喜欢，去消息里聊聊`);
    }
  } else {
    toast(`已喜欢 ${p.name}，等 TA 的回应`);
  }
}

function pass() {
  const pool = visiblePool();
  if (state.busy || state.i >= pool.length) return;
  state.busy = true;
  flyCard('pass');
  advance();
}

/* ---------- likes tab ---------- */
let likesMode = 'who';

function renderLikeStats() {
  const list = likesForMe();
  const z = zhengLikes().length;
  const views = viewsCount();
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('#statViews', views);
  set('#statLikes', list.length);
  set('#statZheng', z);
  set('#likeWhoCount', list.length);
  set('#likeMineCount', state.liked.length);
  set('#meStatLikes', list.length);
  set('#meStatViews', views);
  set('#meStatZheng', z);
}

function renderLikes() {
  const mine = likesMode === 'mine';
  const ppl = mine
    ? state.liked.map(id => PEOPLE.find(x => x.id === id)).filter(Boolean)
    : likesForMe();
  renderLikeStats();

  if (!ppl.length) {
    $('#likesGrid').innerHTML = `<div class="qs-likes-empty"><b>还没有喜欢的人</b><p>去推荐页看看，喜欢过的会出现在这里</p></div>`;
  } else {
    $('#likesGrid').innerHTML = ppl.map((p, idx) => {
      const locked = !mine && !state.vip && idx >= 2;
      const zheng = p.bazi && p.bazi.zheng;
      return `
      <div class="qs-like-card ${locked ? 'locked' : ''} ${zheng ? 'is-zheng' : ''}" data-id="${p.id}" data-locked="${locked ? 1 : 0}">
        <img src="${p.photo}" alt="${p.name}" />
        <div class="lc-shade"></div>
        <span class="lc-badge">已认证</span>
        ${zheng ? '<span class="lc-zheng">正缘</span>' : ''}
        <div class="lc-name">${p.name} <i>${p.age}</i></div>
        ${baziMini(p)}
        ${locked ? `<div class="lc-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4.5" y="10" width="15" height="10" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg><span>开通 VIP 查看</span></div>` : ''}
      </div>`;
    }).join('');
  }

  const tip = $('.qs-vip-tip');
  const rest = likesForMe().length - 2;
  tip.hidden = mine || state.vip || rest <= 0;
  if (!tip.hidden) {
    $('#vipTipTitle').textContent = `还有 ${rest} 个人想认识你`;
    $('#vipTipText').textContent = '开通 VIP 后可查看全部 · 谁喜欢我 / 谁看过我';
  }

  $$('#likesGrid .qs-like-card').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.locked === '1') { openSheet('#sheetVip'); return; }
      const p = PEOPLE.find(x => x.id === el.dataset.id);
      toast(mine
        ? `你已喜欢 ${p.name}${p.bazi.zheng ? ' · 八字正缘' : ''}，等待 TA 的回应`
        : `${p.name} 喜欢你 · 八字合盘 ${p.bazi.score}${p.bazi.zheng ? ' · 正缘' : ''}`);
    });
  });
}

function baziMini(p) {
  if (!p.bazi) return '';
  return `<div class="lc-bazi"><span>八字合盘</span><b>${p.bazi.score}</b></div>`;
}

$$('#likeSeg button').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    likesMode = i === 0 ? 'who' : 'mine';
    $$('#likeSeg button').forEach(b => b.classList.toggle('is-on', b === btn));
    renderLikes();
  });
});

/* ---------- plaza ---------- */
const POSTS = [
  {
    id: 'linwan', name: '林晚', time: '今天 19:20 · 上海 · 长宁',
    text: '周末在楼下听到有人弹《晴天》，站着听了很久。有人也喜欢在傍晚散散步吗？',
    photo: 'assets/match/linwan.jpg', likes: 28, comments: 6
  },
  {
    id: 'zhouye', name: '周野', time: '今天 18:42 · 上海 · 浦东',
    text: '这周走了 18 公里，山顶的风把一周的班味都吹没了。下次想找个人一起。',
    photo: 'assets/match/zhouye.jpg', likes: 41, comments: 9
  },
  {
    id: 'pool_f1', time: '今天 20:10 · 上海 · 杨浦',
    text: '今天带小朋友画「我理想的家」，有个孩子画了两把椅子并排。突然有点想谈恋爱。',
    photo: 'assets/match/pool_f1.jpg', likes: 33, comments: 7
  },
  {
    id: 'pool_m1', time: '今天 21:04 · 上海 · 徐汇',
    text: '加班到九点，回家给自己煮了碗面。稳定的生活里，确实还差一个人。',
    photo: 'assets/match/pool_m1.jpg', likes: 26, comments: 5
  }
];

function renderPlaza() {
  const list = POSTS.filter(post => {
    const p = PEOPLE.find(x => x.id === post.id);
    return p && p.gender === oppGender();
  });
  $('#plazaList').innerHTML = list.map((post, i) => {
    const p = PEOPLE.find(x => x.id === post.id);
    return `
    <article class="qs-post">
      <div class="qs-post-head">
        <div class="qs-post-ava"><img src="${p.photo}" alt="${p.name}" /></div>
        <div><b>${p.name}</b><p>${post.time}</p></div>
      </div>
      <p class="qs-post-text">${post.text}</p>
      <img class="qs-post-img" src="${post.photo}" alt="${p.name}的动态照片" />
      <div class="qs-post-foot">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 20.4s-7.4-4.8-7.4-10.4A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.4 2.8c0 5.6-7.4 10.4-7.4 10.4z"/></svg>
          <em data-i="${i}">${post.likes}</em>
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M21 11.6a8.6 8.6 0 0 1-12.8 7.5L4 20l1-4.1a8.6 8.6 0 1 1 16-4.3z"/></svg>
          ${post.comments}
        </span>
      </div>
    </article>`;
  }).join('');

  $$('#plazaList .qs-post-foot span').forEach((el, idx) => {
    el.addEventListener('click', () => {
      const em = el.querySelector('em');
      if (!em) return;
      let n = Number(em.textContent);
      if (el.classList.contains('is-on')) { el.classList.remove('is-on'); em.textContent = n - 1; }
      else { el.classList.add('is-on'); em.textContent = n + 1; }
    });
  });
}

/* ---------- prefs sheet ---------- */
function renderBubbles() {
  $('#bubbleCloud').innerHTML = PREF_TAGS.map((t, i) =>
    `<button class="qs-bubble ${PREF_SIZES[i]} ${state.prefs.has(t) ? 'is-on' : ''}" data-tag="${t}">${t}</button>`
  ).join('');
  $$('#bubbleCloud .qs-bubble').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.dataset.tag;
      if (state.prefs.has(t)) { state.prefs.delete(t); b.classList.remove('is-on'); }
      else if (state.prefs.size >= 5) { toast('最多选 5 个，先想清楚最在意的'); }
      else { state.prefs.add(t); b.classList.add('is-on'); }
      syncPrefTop();
    });
  });
  syncPrefTop();
}

function syncPrefTop() {
  const el = $('#prefTop');
  const b = el.querySelector('b');
  b.textContent = state.prefs.size ? `已选 ${state.prefs.size} 个` : '待选择';
  const me = $('#mePrefs');
  if (me) me.querySelector('i').textContent = `已设置 ${state.prefs.size} 项`;
}

/* ---------- filter sheet ---------- */
function renderFilters() {
  $('#filterGroups').innerHTML = FILTERS.map((g, gi) => `
    <div class="qs-filter-group">
      <h4>${g.k}</h4>
      <div class="qs-filter-chips" data-g="${gi}">
        ${g.opts.map((o, oi) => `<button class="qs-filter-chip ${(g.k === '认证' ? oi === 0 : oi === g.opts.length - 1) ? 'is-on' : ''}" data-o="${oi}">${o}</button>`).join('')}
      </div>
    </div>
  `).join('');

  $$('#filterGroups .qs-filter-chips').forEach(group => {
    group.addEventListener('click', e => {
      const btn = e.target.closest('.qs-filter-chip');
      if (!btn) return;
      group.querySelectorAll('.qs-filter-chip').forEach(x => x.classList.remove('is-on'));
      btn.classList.add('is-on');
      const el = $('#filterApply');
      const sel = [...$$('#filterGroups .qs-filter-chips')].map(g => g.querySelector('.is-on')).filter(Boolean);
      const narrowed = sel.filter(b => b.textContent !== '不限').length;
      el.textContent = narrowed ? `查看 ${12 - narrowed} 位` : '查看 12 位';
    });
  });
}

/* ---------- sheets ---------- */
function openSheet(sel) {
  const el = $(sel);
  if (!el) return;
  el.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeSheet(el) {
  if (!el) return;
  el.hidden = true;
  document.body.style.overflow = '';
}
function closeAllSheets() {
  $$('.qs-overlay').forEach(o => { o.hidden = true; });
  document.body.style.overflow = '';
}

$$('.qs-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) closeSheet(o); });
});
$$('[data-close]').forEach(b => b.addEventListener('click', () => closeSheet(b.closest('.qs-overlay'))));

/* ---------- match overlay ---------- */
function openMatch(p) {
  state.matchId = p.id;
  $('#matchName').textContent = p.name;
  $('#matchAva').innerHTML = `<img src="${p.photo}" alt="${p.name}" />`;
  const sub = $('#matchSub');
  if (sub) {
    sub.innerHTML = p.bazi && p.bazi.zheng
      ? `八字合盘 ${p.bazi.score} · 互为正缘<br>夫妻宫相合，用神互补`
      : `八字合盘 ${p.bazi ? p.bazi.score : p.score} · 在 ${p.city.split(' · ')[0]} 相遇`;
  }
  $('#matchOverlay').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeMatch() {
  $('#matchOverlay').hidden = true;
  document.body.style.overflow = '';
}
$('#btnKeep').addEventListener('click', closeMatch);
$('#btnSayHi').addEventListener('click', () => {
  closeMatch();
  if (state.matchId) { switchTab('msg'); openChat(state.matchId); }
});

/* ---------- 消息 ---------- */
function chatFor(id) { return state.chats.find(c => c.id === id); }

function ensureChat(p) {
  let c = chatFor(p.id);
  if (!c) { c = { id: p.id, unread: 0, msgs: [] }; state.chats.unshift(c); }
  return c;
}

function unreadTotal() { return state.chats.reduce((n, c) => n + c.unread, 0); }

function renderMsgBadges() {
  const badge = $('#msgBadge');
  if (!badge) return;
  const n = unreadTotal();
  badge.hidden = n === 0;
  badge.textContent = n > 99 ? '99+' : n;
}

function renderMsgList() {
  const list = $('#msgList');
  if (!list) return;
  const isEmpty = state.chats.length === 0;
  $('#msgEmpty').hidden = !isEmpty;
  list.hidden = isEmpty;
  list.innerHTML = state.chats.map(c => {
    const p = PEOPLE.find(x => x.id === c.id);
    if (!p) return '';
    const last = c.msgs[c.msgs.length - 1];
    return `<button class="qs-msg-item" data-id="${c.id}">
      <span class="qs-msg-item-ava"><img src="${p.photo}" alt="${p.name}"></span>
      <span class="qs-msg-item-main">
        <b>${p.name}<span class="qs-vbadge">${CHECK}</span></b>
        <p class="${c.unread ? 'is-new' : ''}">${last ? esc(last.text) : '你们互相喜欢了，先打个招呼吧'}</p>
      </span>
      <span class="qs-msg-item-side">
        <span>${last ? last.t : ''}</span>
        ${c.unread ? `<span class="qs-msg-badge">${c.unread}</span>` : ''}
      </span>
    </button>`;
  }).join('');
  $$('#msgList .qs-msg-item').forEach(el => {
    el.addEventListener('click', () => openChat(el.dataset.id));
  });
  renderMsgBadges();
}

function openChat(id) {
  const p = PEOPLE.find(x => x.id === id);
  if (!p || !isOpp(p)) return;
  const c = ensureChat(p);
  state.chatId = id;
  state.sugOffset = 0;
  c.unread = 0;
  $('#chatAva').innerHTML = `<img src="${p.photo}" alt="${p.name}">`;
  $('#chatName').textContent = p.name;
  $('#chatMeta').textContent = p.bazi && p.bazi.zheng ? `八字正缘 · 合盘 ${p.bazi.score}` : p.city;
  renderChatBody(c, p);
  renderSuggestions(c, p);
  $('#chatInput').value = '';
  $('#subChat').hidden = false;
  renderMsgList();
}

function msgRow(m, p) {
  if (m.from === 'me') {
    return `<div class="msg-row me">
      <span class="msg-ava me">知</span>
      <div class="msg-bubble">${esc(m.text)}</div>
    </div>`;
  }
  return `<div class="msg-row">
    <span class="msg-ava"><img src="${p.photo}" alt=""></span>
    <div class="msg-bubble">${esc(m.text)}</div>
  </div>`;
}

function renderChatBody(c, p) {
  const body = $('#chatBody');
  if (!body) return;
  body.innerHTML = c.msgs.length
    ? `<div class="qs-day">今天</div>${c.msgs.map(m => msgRow(m, p)).join('')}`
    : `<div class="qs-day">你们互相喜欢了，红娘准备了几句话</div>`;
  body.scrollTop = body.scrollHeight;
}

function renderSuggestions(c, p) {
  const empty = c.msgs.length === 0;
  $('#aiSugTitle').textContent = empty ? '红娘开场白' : 'AI 回复建议';
  const pool = empty ? p.openers : p.replies;
  const n = Math.min(3, pool.length);
  const chips = [];
  for (let i = 0; i < n; i++) chips.push(pool[(state.sugOffset + i) % pool.length]);
  $('#aiChips').innerHTML = chips.map(t => `<button type="button" class="qs-ai-chip">${esc(t)}</button>`).join('');
  $$('#aiChips .qs-ai-chip').forEach(b => b.addEventListener('click', () => {
    $('#chatInput').value = b.textContent;
    $('#chatInput').focus();
  }));
}

function sendChat(text) {
  const id = state.chatId;
  if (!id) return;
  const p = PEOPLE.find(x => x.id === id);
  const c = chatFor(id);
  const t = String(text || '').trim();
  if (!p || !c || !t) return;
  c.msgs.push({ from: 'me', text: t });
  $('#chatInput').value = '';
  renderChatBody(c, p);
  renderSuggestions(c, p);

  const body = $('#chatBody');
  const typing = document.createElement('div');
  typing.className = 'msg-row';
  typing.innerHTML = `<span class="msg-ava"><img src="${p.photo}" alt=""></span><div class="msg-typing"><i></i><i></i><i></i></div>`;
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;

  setTimeout(() => {
    typing.remove();
    c.msgs.push({ from: 'them', text: p.auto[Math.floor(Math.random() * p.auto.length)] });
    if (state.chatId === id && !$('#subChat').hidden) {
      renderChatBody(c, p);
      renderSuggestions(c, p);
    }
    renderMsgList();
  }, 1500);
}

/* ---------- 心动画像向导 ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

const wz = { phase: 'intro', round: 0, sets: [], picks: [], avoid: null, qi: 0, answers: [] };

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function openWizard() {
  wz.phase = 'intro';
  wz.round = 0;
  wz.picks = [];
  wz.avoid = null;
  wz.qi = 0;
  wz.answers = [];
  wz.sets = Array.from({ length: 6 }, () => shuffle([...facePoolFor()]).slice(0, 4));
  closeAllSheets();
  $('#wizard').hidden = false;
  renderWizard();
}

function closeWizard() {
  $('#wizard').hidden = true;
  if (onbWizardBack) {
    onbWizardBack = false;
    ONB.step = 6;
    $('#onboard').hidden = false;
    renderOnboard();
  }
}

function introHTML() {
  return `<div class="qw-intro">
    <p class="qw-kicker">心动画像</p>
    <h2>先花一分钟<br><span>让推荐更懂你</span></h2>
    <p>不填也能逛，但推荐只能靠基础条件。填完之后，认知、兴趣、眼缘会分开计算。</p>
    <div class="qw-bullets">
      <div class="qw-bullet"><em>1</em><div><b>6 轮，凭第一眼选</b><i>看照片选心动，最后选出你绝不会考虑的</i></div></div>
      <div class="qw-bullet"><em>2</em><div><b>12 道轻测评</b><i>每题 5 个选项，不考你，只帮你表达</i></div></div>
      <div class="qw-bullet"><em>3</em><div><b>随时可以改</b><i>偏好会跟着你的选择更新</i></div></div>
    </div>
    <div class="qw-actions">
      <button class="qw-btn" id="qwStart">开始，大概 1 分钟</button>
      <button class="qw-ghost" id="qwLater">先逛逛，之后再说</button>
    </div>
  </div>`;
}

function photoHTML() {
  const set = wz.sets[wz.round];
  const last = wz.round >= 5;
  return `<div class="qw-photo-head">
    <p class="qw-quiz-tag">第 ${wz.round + 1} / 6 轮 · 眼缘</p>
    <h2>${last ? '最后一张：你绝不会考虑的' : '这一组里，哪张最有眼缘？'}</h2>
    <p>${last ? '排除掉它，剩下的偏好会更准' : '别想太多，第一眼就好'}</p>
  </div>
  <div class="qw-grid">
    ${set.map(x => `<button class="qw-photo" data-id="${x.id}"><img src="${x.photo}" alt=""></button>`).join('')}
  </div>`;
}

function quizHTML() {
  const q = WQ[wz.qi];
  return `<p class="qw-quiz-tag">${q.g} · 第 ${wz.qi + 1} / 12 题</p>
    <h2 class="qw-quiz-q">${q.q}</h2>
    <div class="qw-scale">
      ${SCALE_OPTS.map((o, i) => `<button data-i="${i}" class="${wz.answers[wz.qi] === i ? 'is-on' : ''}">${o}</button>`).join('')}
    </div>`;
}

function qrRow(label, val, note) {
  return `<div class="qw-result-row">
    <div class="qr-top"><b>${label}</b><em>${val}</em></div>
    <div class="qr-bar"><b style="width:${val}%"></b></div>
    <span class="qr-note">${note}</span>
  </div>`;
}

function calcProfile() {
  const avgFor = d => {
    const idx = WQ.map((q, i) => (q.d === d ? i : -1)).filter(i => i >= 0);
    return idx.reduce((s, i) => s + (wz.answers[i] ?? 3), 0) / idx.length;
  };
  const cogAvg = avgFor('cog');
  const intAvg = avgFor('int');
  const cog = Math.round(52 + (cogAvg / 5) * 46);
  const int = Math.round(52 + (intAvg / 5) * 46);

  const counts = {};
  wz.picks.forEach(x => { counts[x.vibe] = (counts[x.vibe] || 0) + 1; });
  let vibe = '温柔', max = 0;
  Object.entries(counts).forEach(([k, v]) => { if (v > max) { max = v; vibe = k; } });
  const share = wz.picks.length ? max / wz.picks.length : 0.6;
  const face = Math.round(66 + share * 30);

  return {
    cog, int, face, vibe,
    cogNote: cogAvg >= 4 ? '稳定、愿意沟通' : cogAvg >= 3 ? '有空间，也有陪伴' : '自由度优先',
    intNote: intAvg >= 4 ? '爱出门，也爱新鲜' : intAvg >= 3 ? '动静都能接受' : '更享受安静',
    faceNote: `更容易被「${vibe}」的气质吸引`,
    avoid: wz.avoid ? wz.avoid.vibe : ''
  };
}

function resultHTML() {
  const r = calcProfile();
  return `<div class="qw-result">
    <p class="qw-result-kicker">你的心动画像</p>
    <h2>推荐会更贴近你了</h2>
    <p>下面三项分开算，之后每次推荐都会按它们加权。</p>
    <div class="qw-result-card">
      ${qrRow('认知同频', r.cog, r.cogNote)}
      ${qrRow('兴趣同频', r.int, r.intNote)}
      ${qrRow('眼缘', r.face, r.faceNote)}
    </div>
    <div class="qw-actions">
      <button class="qw-btn" id="qwDone">开始看看今天的推荐</button>
      <button class="qw-ghost" id="qwRedo">重新选一次</button>
    </div>
  </div>`;
}

function renderWizard() {
  const body = $('#qwBody');
  const total = 18;
  let done = 0;
  if (wz.phase === 'photo') done = wz.round;
  else if (wz.phase === 'quiz') done = 6 + wz.qi;
  else if (wz.phase === 'result') done = total;
  $('#qwBar').style.width = (done / total * 100) + '%';
  $('#qwCount').textContent = wz.phase === 'intro' ? '' : `${Math.min(done + 1, total)} / ${total}`;
  $('#qwSkip').hidden = wz.phase === 'intro' || wz.phase === 'result';

  if (wz.phase === 'intro') {
    body.innerHTML = introHTML();
    $('#qwStart').addEventListener('click', () => { wz.phase = 'photo'; wz.round = 0; renderWizard(); });
    $('#qwLater').addEventListener('click', closeWizard);
    return;
  }
  if (wz.phase === 'photo') {
    body.innerHTML = photoHTML();
    $$('#qwBody .qw-photo').forEach(el => {
      el.addEventListener('click', () => {
        $$('#qwBody .qw-photo').forEach(x => x.classList.remove('is-on'));
        el.classList.add('is-on');
        const item = FACE_POOL.find(x => x.id === el.dataset.id);
        setTimeout(() => {
          if (wz.round >= 5) { wz.avoid = item; wz.phase = 'quiz'; wz.qi = 0; wz.answers = []; }
          else { wz.picks.push(item); wz.round += 1; }
          renderWizard();
        }, 300);
      });
    });
    return;
  }
  if (wz.phase === 'quiz') {
    body.innerHTML = quizHTML();
    $$('#qwBody .qw-scale button').forEach(b => {
      b.addEventListener('click', () => {
        $$('#qwBody .qw-scale button').forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on');
        wz.answers[wz.qi] = Number(b.dataset.i);
        setTimeout(() => {
          if (wz.qi >= WQ.length - 1) wz.phase = 'result';
          else wz.qi += 1;
          renderWizard();
        }, 240);
      });
    });
    return;
  }
  body.innerHTML = resultHTML();
  $('#qwDone').addEventListener('click', () => finishWizard(calcProfile()));
  $('#qwRedo').addEventListener('click', openWizard);
}

function finishWizard(profile) {
  state.profile = profile;
  store.set('yq_match_setup_done', '1');
  store.set('yq_match_profile', JSON.stringify(profile));
  closeWizard();
  refreshSetupUI();
  toast('心动画像已保存，推荐会跟着它调整');
}

function refreshSetupUI() {
  const done = !!state.profile;
  const banner = $('#setupBanner');
  if (banner) banner.hidden = done;
  const pe = $('#peState');
  if (pe) pe.textContent = done ? '已完善 · 推荐按认知 / 兴趣 / 眼缘加权' : '还没完善 · 推荐只能靠基础条件';
  const go = $('#peGo');
  if (go) go.textContent = done ? '重新完善' : '去完善';
  const meState = $('#mePortraitState');
  if (meState) meState.textContent = done ? '已完善' : '还没完善';
}

function initProfile() {
  try {
    const done = store.get('yq_match_setup_done') === '1';
    const raw = store.get('yq_match_profile');
    state.profile = done && raw ? JSON.parse(raw) : null;
  } catch (e) {
    state.profile = null;
  }
  state.points = Number(store.get('yq_points') || 0) || 0;
  state.rewardClaimed = store.get('yq_reward_claimed') === '1';
  try {
    state.myCard = JSON.parse(store.get('yq_mycard') || 'null');
  } catch (e) {
    state.myCard = null;
  }
}

/* ---------- 资料卡 + 积分 ---------- */
const PF_POOL_M = ['assets/match/pool_m1.jpg', 'assets/match/pool_m2.jpg', 'assets/match/pool_m3.jpg', 'assets/match/pool_m4.jpg', 'assets/match/pool_b.jpg'];
const PF_POOL_F = ['assets/match/pool_f1.jpg', 'assets/match/pool_f2.jpg', 'assets/match/pool_f3.jpg', 'assets/match/pool_f4.jpg', 'assets/match/pool_a.jpg', 'assets/match/pool_c.jpg'];
const PF = { photos: [], tags: [] };

const POINT_REWARDS = [
  { id: 'view', name: '查看「谁看过我」1 天', desc: '看看最近谁在关注你', cost: 100 },
  { id: 'boost', name: '优先推荐 24 小时', desc: '在同城推荐里排得更靠前', cost: 200 },
  { id: 'zheng', name: '八字正缘体验 1 天', desc: '只看与你互为正缘的人', cost: 300 },
  { id: 'offline', name: '线下同频局抵扣 ¥50', desc: '双人活动报名时直接抵用', cost: 500 }
];

const pfPool = () => (myGender() === 'm' ? PF_POOL_M : PF_POOL_F);

function persistPoints() {
  store.set('yq_points', String(state.points));
  store.set('yq_reward_claimed', state.rewardClaimed ? '1' : '0');
}

function renderPoints() {
  const bal = $('#pointsBalance');
  if (bal) bal.textContent = state.points;
  const ms = $('#mePointsState');
  if (ms) ms.textContent = `${state.points} 积分`;
  const pfs = $('#meProfileState');
  if (pfs) pfs.textContent = state.myCard ? `已完善 · ${(state.myCard.photos || []).length} 张照片` : '未完善';
  const mtag = $('#meProfileTag');
  if (mtag) mtag.hidden = !!state.rewardClaimed;
  const rt = $('#pfRewardTag');
  if (rt) rt.textContent = state.rewardClaimed ? '已领取 +500' : '完成 +500 积分';
  const list = $('#pointsRewards');
  if (list) {
    list.innerHTML = POINT_REWARDS.map(r => `
      <div class="qs-pt-item">
        <span class="pt-main"><b>${r.name}</b><i>${r.desc}</i></span>
        <em>${r.cost} 积分</em>
        <button class="pt-btn" data-cost="${r.cost}" data-rid="${r.id}" ${state.points < r.cost ? 'disabled' : ''}>兑换</button>
      </div>`).join('');
  }
}

function renderActBanner() {
  const el = $('#actBanner');
  if (!el) return;
  el.hidden = !state.onboard || !!state.myCard;
}

function openPoints() {
  renderPoints();
  openSheet('#sheetPoints');
}

function redeemPoint(cost, rid) {
  if (state.points < cost) { toast('积分不够，完善资料或邀请好友都能拿积分'); return; }
  state.points -= cost;
  persistPoints();
  if (rid === 'zheng' && !state.zhengPaid) {
    state.zhengPaid = true;
    updateZhengUI();
  }
  renderPoints();
  toast('已兑换 · 权益已生效（原型演示不产生真实扣费）');
}

function ptSignIn() {
  const d = new Date();
  const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  if (store.get('yq_signin') === today) { toast('今天已经签到过了，明天再来'); return; }
  store.set('yq_signin', today);
  state.points += 10;
  persistPoints();
  renderPoints();
  toast('签到成功，+10 积分');
}

function openProfileSheet() {
  const card = state.myCard || { photos: [], bio: '', about: '', expect: '', tags: [] };
  PF.photos = (card.photos || []).slice(0, 6);
  PF.tags = (card.tags || []).slice(0, 5);
  if (!PF.tags.length && state.onboard) PF.tags = (state.onboard.interests || []).slice(0, 5);
  $('#pfBio').value = card.bio || '';
  $('#pfAbout').value = card.about || '';
  $('#pfExpect').value = card.expect || '';
  renderPfPhotos();
  renderPfTags();
  renderPoints();
  openSheet('#sheetProfile');
}

function renderPfPhotos() {
  const host = $('#pfPhotos');
  if (!host) return;
  let html = PF.photos.map((src, i) => `
    <div class="qs-pf-photo">
      <img src="${src}" alt="照片 ${i + 1}">
      ${i === 0 ? '<span class="pf-cover">封面</span>' : ''}
      <button class="pf-del" data-i="${i}" aria-label="删除这张照片">×</button>
    </div>`).join('');
  if (PF.photos.length < 6) html += `<button class="qs-pf-photo is-add" id="pfAdd" aria-label="添加照片">＋</button>`;
  host.innerHTML = html;
  const tip = $('#pfPhotoTip');
  if (tip) tip.textContent = PF.photos.length < 2
    ? `至少 2 张，还差 ${2 - PF.photos.length} 张`
    : `${PF.photos.length} / 6 张 · 第 1 张为封面`;
  const add = $('#pfAdd');
  if (add) add.addEventListener('click', pfAddPhoto);
  $$('#pfPhotos .pf-del').forEach(b => b.addEventListener('click', () => pfRemovePhoto(Number(b.dataset.i))));
  updatePfCount();
}

function pfAddPhoto() {
  if (PF.photos.length >= 6) { toast('最多 6 张'); return; }
  const pool = pfPool();
  const next = pool.find(src => !PF.photos.includes(src)) || pool[PF.photos.length % pool.length];
  PF.photos.push(next);
  renderPfPhotos();
}

function pfRemovePhoto(i) {
  PF.photos.splice(i, 1);
  renderPfPhotos();
}

function pfTotal() {
  return ['#pfBio', '#pfAbout', '#pfExpect']
    .map(sel => ($(sel) ? $(sel).value.length : 0))
    .reduce((a, b) => a + b, 0);
}

function updatePfCount() {
  const el = $('#pfCountText');
  if (!el) return;
  const total = pfTotal();
  el.innerHTML = `已写 <b>${total}</b> / 500 字`;
}

function renderPfTags() {
  const host = $('#pfTags');
  if (!host) return;
  host.innerHTML = ONB_INTERESTS.map(t => `<button class="qs-pf-tag ${PF.tags.includes(t) ? 'is-on' : ''}" data-t="${t}">${t}</button>`).join('');
  $$('#pfTags .qs-pf-tag').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.t;
    if (PF.tags.includes(t)) PF.tags = PF.tags.filter(x => x !== t);
    else if (PF.tags.length >= 5) { toast('最多选 5 个'); return; }
    else PF.tags.push(t);
    b.classList.toggle('is-on');
  }));
}

function saveProfile() {
  if (PF.photos.length < 2) { toast('至少上传 2 张照片'); return; }
  const bio = $('#pfBio').value.trim();
  const about = $('#pfAbout').value.trim();
  if (!bio || !about) { toast('写一句介绍和关于我，别人更容易认识你'); return; }
  if (!PF.tags.length) { toast('选几个兴趣标签吧'); return; }
  state.myCard = {
    photos: PF.photos.slice(), bio, about,
    expect: $('#pfExpect').value.trim(),
    tags: PF.tags.slice(), updated: Date.now()
  };
  store.set('yq_mycard', JSON.stringify(state.myCard));
  let gained = 0;
  if (!state.rewardClaimed) {
    state.rewardClaimed = true;
    gained = 500;
    state.points += 500;
    persistPoints();
  }
  renderPoints();
  renderActBanner();
  closeSheet($('#sheetProfile'));
  toast(gained ? `资料卡已保存，+${gained} 积分已到账` : '资料卡已更新');
}

/* ---------- 从聊天跳到推荐页的那张资料卡 ---------- */
function openProfileCard(id) {
  const p = PEOPLE.find(x => x.id === id && isOpp(x));
  if (!p) return;
  if (state.zheng && !(p.bazi && p.bazi.zheng)) {
    state.zheng = false;
    updateZhengUI();
  }
  switchTab('reco');
  const pool = visiblePool();
  const idx = pool.findIndex(x => x.id === id);
  if (idx < 0) {
    state.i = 0;
    renderCard(true);
    toast('TA 已不在当前推荐条件里，可以放宽筛选看看');
    return;
  }
  state.i = idx;
  renderCard();
  const feed = $('#feed');
  if (feed) feed.scrollTop = 0;
  toast('这里是你在推荐页喜欢 TA 的资料卡');
}

/* ---------- 注册 / 基础信息 ---------- */
const ONB = {
  step: 0, gender: null, y: 1995, m: 6, d: 15, hour: null, minute: null, unknown: true,
  real: false, face: false, name: '', idNo: '', origin: '', ipCity: '上海', interests: [], reentry: false
};

const ONB_INTERESTS = ['旅行', '咖啡', '电影', '音乐', '运动', '读书', '美食', '摄影', '宠物', '户外', '看展', '游戏', '健身', '手作', '夜跑', '做饭'];

const ID_ORIGIN = {
  '11': '北京', '12': '天津', '31': '上海', '32': '江苏 · 南京', '33': '浙江 · 杭州', '34': '安徽 · 合肥',
  '35': '福建 · 厦门', '36': '江西 · 南昌', '37': '山东 · 青岛', '41': '河南 · 郑州', '42': '湖北 · 武汉',
  '43': '湖南 · 长沙', '44': '广东 · 广州', '50': '重庆', '51': '四川 · 成都', '61': '陕西 · 西安'
};
const originFromId = id => {
  const s = String(id || '');
  return s.length >= 4 ? (ID_ORIGIN[s.slice(0, 2)] || '上海') : '';
};

const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const shichenOf = h => SHICHEN[Math.floor(((h + 1) % 24) / 2)];
const pad2 = n => String(n).padStart(2, '0');
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();

function ageOf(y, m, d) {
  const now = new Date();
  let a = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) a -= 1;
  return Math.max(18, a);
}

function zodiacOf(m, d) {
  const cut = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  const signs = ['摩羯', '水瓶', '双鱼', '白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯'];
  return signs[d < cut[m - 1] ? m - 1 : m];
}

const ONB_ICONS = {
  male: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="10" cy="14" r="5.2"/><path d="M14 10l6-6M15 4h5v5"/></svg>',
  female: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 17.5h6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3l7 3v5.4c0 4.4-2.9 7.8-7 9.6-4.1-1.8-7-5.2-7-9.6V6z"/><path d="M9 12l2.1 2.1L15.4 10"/></svg>',
  face: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9M20 15v2.5A2.5 2.5 0 0 1 17.5 20H15M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15"/><circle cx="9.2" cy="10.6" r="1"/><circle cx="14.8" cy="10.6" r="1"/><path d="M9.6 15c.7.9 1.5 1.3 2.4 1.3s1.7-.4 2.4-1.3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8.4"/><path d="M12 7.6v4.9l3 1.8"/></svg>'
};

const yearOptions = () => {
  let s = '';
  for (let y = 2007; y >= 1975; y--) s += `<option value="${y}" ${y === ONB.y ? 'selected' : ''}>${y}</option>`;
  return s;
};
const monthOptions = () => Array.from({ length: 12 }, (_, i) => i + 1)
  .map(m => `<option value="${m}" ${m === ONB.m ? 'selected' : ''}>${m}</option>`).join('');
const dayOptions = () => Array.from({ length: daysInMonth(ONB.y, ONB.m) }, (_, i) => i + 1)
  .map(d => `<option value="${d}" ${d === ONB.d ? 'selected' : ''}>${d}</option>`).join('');
const hourOptions = () => {
  let s = `<option value="" ${ONB.hour == null ? 'selected' : ''}>不填</option>`;
  for (let h = 0; h < 24; h++) s += `<option value="${h}" ${ONB.hour === h ? 'selected' : ''}>${pad2(h)}:00 · ${shichenOf(h)}时</option>`;
  return s;
};
const minOptions = () => [0, 15, 30, 45]
  .map(m => `<option value="${m}" ${ONB.minute === m ? 'selected' : ''}>${pad2(m)}</option>`).join('');

function onboardStepHTML() {
  if (ONB.step === 0) {
    return `<div class="onb-head">
      <p class="onb-kicker">第 1 步 / 共 7 步 · 必填</p>
      <h2>先告诉同频<br><span>你是谁</span></h2>
      <p class="onb-sub">性别决定为你推荐谁：男生只看女生，女生只看男生。生日会用于八字合盘。</p>
    </div>
    <div class="onb-genders">
      <button class="onb-gender ${ONB.gender === 'm' ? 'is-on' : ''}" data-g="m">
        <span class="og-ico">${ONB_ICONS.male}</span>
        <b>我是男生</b><i>为你推荐女生</i><em>必填</em>
      </button>
      <button class="onb-gender ${ONB.gender === 'f' ? 'is-on' : ''}" data-g="f">
        <span class="og-ico">${ONB_ICONS.female}</span>
        <b>我是女生</b><i>为你推荐男生</i><em>必填</em>
      </button>
    </div>
    <div class="onb-tip"><span>i</span>生日与出生时间只用于匹配计算，不会公开展示给其他人。</div>
    <div class="onb-actions">
      <button class="onb-next" id="onbNext" ${ONB.gender ? '' : 'disabled'}>下一步 · 填写生日</button>
    </div>`;
  }
  if (ONB.step === 1) {
    const age = ageOf(ONB.y, ONB.m, ONB.d);
    return `<div class="onb-head">
      <p class="onb-kicker">第 2 步 / 共 7 步 · 必填</p>
      <h2>你的生日</h2>
      <p class="onb-sub">用来计算你的星座与八字，也是推荐的必填信息。</p>
    </div>
    <div class="onb-date">
      <label><span>年</span><select id="onbY">${yearOptions()}</select></label>
      <label><span>月</span><select id="onbM">${monthOptions()}</select></label>
      <label><span>日</span><select id="onbD">${dayOptions()}</select></label>
    </div>
    <div class="onb-zodiac">
      <span class="oz-ico">${ONB_ICONS.clock}</span>
      <div><b>${zodiacOf(ONB.m, ONB.d)}座 · ${age} 岁</b><i>按公历生日换算 · 之后可补充出生时间</i></div>
    </div>
    <div class="onb-actions">
      <button class="onb-back" id="onbBack">上一步</button>
      <button class="onb-next" id="onbNext">下一步 · 出生时间</button>
    </div>`;
  }
  if (ONB.step === 2) {
    return `<div class="onb-head">
      <p class="onb-kicker">第 3 步 / 共 7 步 · 可选</p>
      <h2>出生时间<span class="onb-opt">选填</span></h2>
      <p class="onb-sub">八字合盘精确到时辰。现在不填也能继续，之后在「我的」里补上，合盘会更准。</p>
    </div>
    <div class="onb-time ${ONB.unknown ? 'is-off' : ''}">
      <label><span>时</span><select id="onbHour" ${ONB.unknown ? 'disabled' : ''}>${hourOptions()}</select></label>
      <em>:</em>
      <label><span>分</span><select id="onbMin" ${ONB.unknown ? 'disabled' : ''}>${minOptions()}</select></label>
    </div>
    <button class="onb-unknown ${ONB.unknown ? 'is-on' : ''}" id="onbUnknown">${ONB.unknown ? '已选择：我不知道出生时间' : '我不知道出生时间，先跳过'}</button>
    <div class="onb-tip"><span>i</span>只用于合盘，不展示具体时间。可以之后随时补充。</div>
    <div class="onb-actions">
      <button class="onb-back" id="onbBack">上一步</button>
      <button class="onb-next" id="onbNext">${ONB.unknown ? '跳过，下一步' : '保存并继续'}</button>
    </div>`;
  }
  if (ONB.step === 4) {
    return `<div class="onb-head">
      <p class="onb-kicker">第 5 步 / 共 7 步 · 至少 3 个</p>
      <h2>平时最让你<br><span>有感觉的事</span></h2>
      <p class="onb-sub">选出 3–5 个。兴趣同频只算你们真正会一起做的事。</p>
    </div>
    <div class="onb-chips" id="onbChips">
      ${ONB_INTERESTS.map(t => `<button class="onb-chip ${ONB.interests.includes(t) ? 'is-on' : ''}" data-t="${t}">${t}</button>`).join('')}
    </div>
    <div class="onb-tip"><span>i</span>已选 <b id="onbChipCount">${ONB.interests.length}</b> 个，最多 5 个。之后可以随时补充。</div>
    <div class="onb-actions">
      <button class="onb-back" id="onbBack">上一步</button>
      <button class="onb-next" id="onbNext" ${ONB.interests.length < 3 ? 'disabled' : ''}>下一步 · 心动画像</button>
    </div>`;
  }
  if (ONB.step === 5) {
    return `<div class="onb-head">
      <p class="onb-kicker">第 6 步 / 共 7 步 · 约 1 分钟</p>
      <h2>让推荐先<br><span>认识你</span></h2>
      <p class="onb-sub">6 轮凭第一眼选照片 + 12 道轻测评，认知、兴趣、眼缘会分开计算。</p>
    </div>
    <div class="onb-bullets">
      <div class="onb-bullet"><em>1</em><div><b>6 轮眼缘</b><i>看照片选心动，最后排除你绝不会考虑的类型</i></div></div>
      <div class="onb-bullet"><em>2</em><div><b>12 道轻测评</b><i>不考你，只帮你把偏好说清楚</i></div></div>
    </div>
    <div class="onb-tip"><span>i</span>不填也能开始，但推荐只能靠基础条件。之后可在「我的」补。</div>
    <div class="onb-actions">
      <button class="onb-next" id="onbWizard">开始心动画像</button>
      <button class="onb-ghost" id="onbLater">之后再填</button>
    </div>`;
  }
  if (ONB.step === 3) {
    const verified = ONB.real === true;
    const faced = ONB.face === true;
    const realTxt = ONB.real === 'ing' ? '认证中…' : verified ? '已认证' : '身份证信息仅用于核验';
    const faceTxt = ONB.face === 'ing' ? '扫脸中…' : faced ? '已认证' : '与实名信息比对，防冒用';
    return `<div class="onb-head">
    <p class="onb-kicker">第 4 步 / 共 7 步 · 可跳过</p>
    <h2>完成认证<span class="onb-opt">建议完成</span></h2>
    <p class="onb-sub">实名 + 扫脸放在注册里完成，能减少虚假资料，也让你的喜欢更容易被认真对待。</p>
  </div>
  <div class="onb-verify">
    <div class="ov-row ${verified ? 'is-done' : ''} ${ONB.real === 'ing' ? 'is-ing' : ''}">
      <span class="ov-ico">${ONB_ICONS.shield}</span>
      <div class="ov-main"><b>实名认证</b><i>${realTxt}</i></div>
      <button class="ov-btn" id="onbReal" ${verified || ONB.real === 'ing' ? 'disabled' : ''}>${verified ? '已完成' : ONB.real === 'ing' ? '认证中' : '开始认证'}</button>
    </div>
    <div class="ov-row ${faced ? 'is-done' : ''} ${ONB.face === 'ing' ? 'is-ing' : ''}">
      <span class="ov-ico">${ONB_ICONS.face}</span>
      <div class="ov-main"><b>扫脸认证</b><i>${faceTxt}</i></div>
      <button class="ov-btn" id="onbFace" ${faced || ONB.face === 'ing' ? 'disabled' : ''}>${faced ? '已完成' : ONB.face === 'ing' ? '扫脸中' : '开始扫脸'}</button>
    </div>
  </div>
  <div class="onb-id">
    <label>身份证号<span>仅核验身份 · 不公开展示</span></label>
    <input id="onbId" value="${esc(ONB.idNo)}" placeholder="18 位身份证号" maxlength="18" inputmode="numeric" autocomplete="off">
    <div class="onb-locals">
      <span><i>籍贯</i><b id="onbOriginVal">${ONB.origin || '待识别'}</b></span>
      <span><i>当前位置</i><b>${ONB.ipCity} · IP 识别</b></span>
    </div>
  </div>
  <div class="onb-name">
    <label>真实姓名<span>仅认证使用，不公开</span></label>
    <input id="onbName" value="${esc(ONB.name)}" placeholder="与身份证一致" maxlength="20" autocomplete="off">
  </div>
  <div class="onb-actions">
    <button class="onb-next" id="${ONB.reentry ? 'onbSave' : 'onbFinish'}">${ONB.reentry ? '保存并返回' : '下一步 · 选兴趣'}</button>
    <button class="onb-ghost" id="${ONB.reentry ? 'onbCancel' : 'onbSkip'}">${ONB.reentry ? '取消' : '认证先跳过'}</button>
  </div>`;
  }

  const nm = String(ONB.name || '').trim();
  return `<div class="onb-finish">
    <div class="onb-finish-mark">${ONB_ICONS.shield}</div>
    <p class="onb-kicker">第 7 步 / 共 7 步 · 完成</p>
    <h2>${nm ? `${esc(nm)}，` : ''}欢迎来到<span>同频</span></h2>
    <p class="onb-sub">已按你的性别与生日准备好推荐${state.profile ? '，心动画像已保存' : '，心动画像还没填'}。</p>
    <div class="onb-summary">
      <span>${ONB.gender === 'm' ? '男生' : '女生'}</span>
      <span>${ageOf(ONB.y, ONB.m, ONB.d)} 岁</span>
      <span>${zodiacOf(ONB.m, ONB.d)}座</span>
      <span>籍贯 ${ONB.origin || '上海'}</span>
      <span>${ONB.interests.length} 个兴趣</span>
    </div>
    <div class="onb-reward">
      <div class="or-top"><b>新人活动 · 完善资料</b><em>限时</em></div>
      <div class="or-mid">
        <b>+500<small>积分</small></b>
        <p>上传 2–6 张照片，写下你的介绍。<br>资料卡越完整，被认真喜欢的机会越高。</p>
      </div>
    </div>
    <div class="onb-actions">
      <button class="onb-next" id="onbProfile">去完善资料，领 500 积分</button>
      <button class="onb-ghost" id="onbGo">先逛推荐</button>
    </div>
  </div>`;
}

function renderOnboard() {
  const body = $('#onbBody');
  if (!body) return;
  [...$('#onbSteps').children].forEach((el, i) => el.classList.toggle('is-on', i <= ONB.step));
  body.innerHTML = onboardStepHTML();
  body.scrollTop = 0;

  if (ONB.step === 0) {
    $$('#onbBody .onb-gender').forEach(btn => btn.addEventListener('click', () => {
      ONB.gender = btn.dataset.g;
      renderOnboard();
    }));
    const next = $('#onbNext');
    next.addEventListener('click', () => { ONB.step = 1; renderOnboard(); });
  } else if (ONB.step === 1) {
    const sync = () => {
      ONB.y = Number($('#onbY').value);
      ONB.m = Number($('#onbM').value);
      ONB.d = Math.min(Number($('#onbD').value), daysInMonth(ONB.y, ONB.m));
      renderOnboard();
    };
    $('#onbY').addEventListener('change', sync);
    $('#onbM').addEventListener('change', sync);
    $('#onbD').addEventListener('change', sync);
    $('#onbBack').addEventListener('click', () => { ONB.step = 0; renderOnboard(); });
    $('#onbNext').addEventListener('click', () => { ONB.step = 2; renderOnboard(); });
  } else if (ONB.step === 2) {
    $('#onbUnknown').addEventListener('click', () => { ONB.unknown = !ONB.unknown; ONB.hour = null; ONB.minute = null; renderOnboard(); });
    $('#onbHour').addEventListener('change', e => { ONB.hour = e.target.value === '' ? null : Number(e.target.value); });
    $('#onbMin').addEventListener('change', e => { ONB.minute = e.target.value === '' ? null : Number(e.target.value); });
    $('#onbBack').addEventListener('click', () => { ONB.step = 1; renderOnboard(); });
    $('#onbNext').addEventListener('click', () => {
      const h = $('#onbHour');
      if (!ONB.unknown && h && h.value !== '') ONB.hour = Number(h.value);
      if (!ONB.unknown) ONB.minute = Number($('#onbMin').value);
      ONB.step = 3;
      renderOnboard();
    });
  } else if (ONB.step === 3) {
    $('#onbReal').addEventListener('click', () => {
      ONB.real = 'ing'; renderOnboard();
      setTimeout(() => { ONB.real = true; renderOnboard(); toast('实名认证已通过'); }, 1300);
    });
    $('#onbFace').addEventListener('click', () => {
      ONB.face = 'ing'; renderOnboard();
      setTimeout(() => { ONB.face = true; renderOnboard(); toast('扫脸认证已通过'); }, 1600);
    });
    $('#onbName').addEventListener('input', e => { ONB.name = e.target.value; });
    $('#onbId').addEventListener('input', e => {
      ONB.idNo = e.target.value.replace(/[^\dXx]/g, '').slice(0, 18);
      ONB.origin = originFromId(ONB.idNo);
      const ob = $('#onbOriginVal');
      if (ob) ob.textContent = ONB.origin || '待识别';
    });
    const save = $('#onbSave');
    if (save) {
      save.addEventListener('click', finishMaintenance);
      $('#onbCancel').addEventListener('click', () => {
        ONB.reentry = false;
        $('#onboard').hidden = true;
      });
    } else {
      $('#onbFinish').addEventListener('click', () => { ONB.step = 4; renderOnboard(); });
      $('#onbSkip').addEventListener('click', () => { ONB.real = false; ONB.face = false; ONB.step = 4; renderOnboard(); });
    }
  } else if (ONB.step === 4) {
    $$('#onbBody .onb-chip').forEach(btn => btn.addEventListener('click', () => {
      const t = btn.dataset.t;
      if (ONB.interests.includes(t)) ONB.interests = ONB.interests.filter(x => x !== t);
      else if (ONB.interests.length >= 5) { toast('最多选 5 个'); return; }
      else ONB.interests.push(t);
      btn.classList.toggle('is-on');
      const c = $('#onbChipCount');
      if (c) c.textContent = ONB.interests.length;
      $('#onbNext').disabled = ONB.interests.length < 3;
    }));
    $('#onbBack').addEventListener('click', () => { ONB.step = 3; renderOnboard(); });
    $('#onbNext').addEventListener('click', () => { ONB.step = 5; renderOnboard(); });
  } else if (ONB.step === 5) {
    $('#onbWizard').addEventListener('click', () => {
      onbWizardBack = true;
      $('#onboard').hidden = true;
      openWizard();
    });
    $('#onbLater').addEventListener('click', () => { ONB.step = 6; renderOnboard(); });
  } else {
    $('#onbProfile').addEventListener('click', () => { finishOnboard(); openProfileSheet(); });
    $('#onbGo').addEventListener('click', finishOnboard);
  }
}

function finishOnboard(skipVerify) {
  if (!ONB.gender) { ONB.step = 0; renderOnboard(); toast('先选择你的性别'); return; }
  if (skipVerify) { ONB.real = false; ONB.face = false; }
  const hour = ONB.unknown ? null : ONB.hour;
  const minute = ONB.unknown ? null : (ONB.minute || 0);
  state.onboard = {
    gender: ONB.gender, y: ONB.y, m: ONB.m, d: ONB.d,
    hour, minute,
    verified: !!(ONB.real === true && ONB.face === true),
    name: String(ONB.name || '').trim(),
    idNo: ONB.idNo,
    origin: ONB.origin || '上海',
    ipCity: ONB.ipCity,
    interests: ONB.interests.slice()
  };
  ONB.reentry = false;
  store.set('yq_onboard', JSON.stringify(state.onboard));
  $('#onboard').hidden = true;
  state.i = 0;
  seedChats(state.onboard.gender);
  seedLiked();
  renderCard(true);
  renderPlaza();
  renderLikes();
  renderMsgList();
  applyOnboardUI();
  renderActBanner();
  renderPoints();
  toast('欢迎来到同频，已按你的性别为你推荐');
}

function finishMaintenance() {
  const o = state.onboard;
  if (!o) return;
  o.verified = !!(ONB.real === true && ONB.face === true);
  o.name = String(ONB.name || '').trim() || o.name;
  o.idNo = ONB.idNo;
  o.origin = ONB.origin || o.origin || '上海';
  store.set('yq_onboard', JSON.stringify(o));
  ONB.reentry = false;
  $('#onboard').hidden = true;
  applyOnboardUI();
  toast(o.verified ? '实名认证、扫脸认证已更新' : '认证信息已保存');
}

function openOnboard(step) {
  if (state.onboard) {
    ONB.gender = state.onboard.gender;
    ONB.y = state.onboard.y;
    ONB.m = state.onboard.m;
    ONB.d = state.onboard.d;
    ONB.hour = state.onboard.hour;
    ONB.minute = state.onboard.minute;
    ONB.unknown = state.onboard.hour == null;
    ONB.real = state.onboard.verified;
    ONB.face = state.onboard.verified;
    ONB.name = state.onboard.name || '';
    ONB.idNo = state.onboard.idNo || '';
    ONB.origin = state.onboard.origin || '';
    ONB.ipCity = state.onboard.ipCity || '上海';
    ONB.interests = (state.onboard.interests || []).slice();
    ONB.reentry = true;
  }
  ONB.step = step;
  $('#onboard').hidden = false;
  renderOnboard();
}

function applyOnboardUI() {
  const o = state.onboard;
  const nm = $('#meName');
  if (!o || !nm) return;
  const name = o.name || '知夏';
  const age = ageOf(o.y, o.m, o.d);
  $('#meAva').textContent = name.slice(0, 1);
  nm.textContent = name;
  $('#meAge').textContent = age;
  $('#meSub').textContent = `${o.gender === 'm' ? '男生' : '女生'} · 籍贯${o.origin || '上海'} · 现在${o.ipCity || '上海'}`;
  const badge = $('#meBadge');
  badge.innerHTML = o.verified
    ? `${ONB_ICONS.shield}<span>实名认证 · 扫脸认证 已完成</span>`
    : `${ONB_ICONS.shield}<span class="is-warn">未完成认证 · 点「我的认证」补齐</span>`;
  const verify = $('#meVerifyState');
  if (verify) verify.textContent = o.verified ? '实名 + 扫脸 已完成' : '未完成 · 去认证';
  const birth = $('#meBirthState');
  if (birth) birth.textContent = o.hour == null ? '待补充 · 填了合盘更准' : `${pad2(o.hour)}:${pad2(o.minute || 0)} 出生 · 合盘已启用`;
  const nudge = $('#birthNudge');
  if (nudge) nudge.hidden = !(o.hour == null && store.get('yq_birth_skip') !== '1');
  const zs = $('#meZhengState');
  if (zs) zs.textContent = state.zhengPaid ? (state.zheng ? '已开通 · 只看正缘' : '已开通 · 未开启') : '单独开通';
  renderLikeStats();
  renderPoints();
  renderActBanner();
}

function initOnboard() {
  try {
    const raw = store.get('yq_onboard');
    const o = raw ? JSON.parse(raw) : null;
    if (o && o.gender && o.y) state.onboard = o;
  } catch (e) {
    state.onboard = null;
  }
  if (state.onboard) {
    $('#onboard').hidden = true;
  } else {
    $('#onboard').hidden = false;
    renderOnboard();
  }
  applyOnboardUI();
}

/* ---------- 出生时间补充 ---------- */
function fillBirthSelects() {
  if ($('#birthHour').options.length) return;
  let hs = `<option value="">不填</option>`;
  for (let h = 0; h < 24; h++) hs += `<option value="${h}">${pad2(h)}:00 · ${shichenOf(h)}时</option>`;
  $('#birthHour').innerHTML = hs;
  $('#birthMin').innerHTML = [0, 15, 30, 45].map(m => `<option value="${m}">${pad2(m)}</option>`).join('');
}

function openBirthSheet() {
  fillBirthSelects();
  const o = state.onboard || {};
  $('#birthHour').value = o.hour == null ? '' : String(o.hour);
  $('#birthMin').value = String(o.minute == null ? 0 : o.minute);
  openSheet('#sheetBirth');
}

function saveBirth() {
  if (!state.onboard) return;
  const h = $('#birthHour').value;
  state.onboard.hour = h === '' ? null : Number(h);
  state.onboard.minute = h === '' ? null : Number($('#birthMin').value);
  store.set('yq_birth_skip', h === '' ? '1' : '0');
  store.set('yq_onboard', JSON.stringify(state.onboard));
  closeSheet($('#sheetBirth'));
  applyOnboardUI();
  toast(h === '' ? '已记录：出生时间待补充' : '出生时间已保存，八字合盘已重算');
}

/* ---------- toast ---------- */
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

/* ---------- tabs ---------- */
const SCREENS = { reco: 'screen-reco', likes: 'screen-likes', msg: 'screen-msg', me: 'screen-me' };

function switchTab(key) {
  $$('#tabbar button').forEach(b => b.classList.toggle('is-active', b.dataset.tab === key));
  Object.entries(SCREENS).forEach(([k, id]) => {
    const el = $('#' + id);
    if (el) el.classList.toggle('is-active', k === key);
  });
  $('#subChat').hidden = true;
  if (key === 'likes') renderLikes();
  if (key === 'msg') renderMsgList();
  if (key === 'me') applyOnboardUI();
}

$$('#tabbar button').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ---------- 正缘付费 ---------- */
function updateZhengUI() {
  const btn = $('#zhengFilterBtn');
  if (btn) {
    btn.textContent = state.zheng ? '已开启' : '开通';
    btn.classList.toggle('is-on', state.zheng);
  }
  const zs = $('#meZhengState');
  if (zs) zs.textContent = state.zhengPaid ? (state.zheng ? '已开通 · 只看正缘' : '已开通 · 未开启') : '单独开通';
}

function toggleZheng() {
  if (!state.zhengPaid) { openSheet('#sheetZheng'); return; }
  state.zheng = !state.zheng;
  state.i = 0;
  updateZhengUI();
  renderCard(true);
  renderLikes();
  toast(state.zheng ? '已开启：只推荐八字正缘' : '已关闭正缘筛选，回到全部推荐');
}

/* ---------- wiring ---------- */
$('#btnLike').addEventListener('click', like);
$('#btnPass').addEventListener('click', pass);
$('#btnFlower').addEventListener('click', () => {
  const pool = visiblePool();
  const p = pool[state.i];
  if (!p) return;
  state.flowerCount += 1;
  toast(`已送出一朵花给 ${p.name}，TA 会收到提醒`);
});
$('#btnPrefs').addEventListener('click', () => openSheet('#sheetPrefs'));
$('#donePrefs').addEventListener('click', () => openSheet('#sheetFilter'));
$('#doneRestart').addEventListener('click', () => { state.i = 0; renderCard(); toast('已为你继续推荐'); });
$('#mePrefs').addEventListener('click', () => openSheet('#sheetPrefs'));
$('#meBirth').addEventListener('click', openBirthSheet);
$('#meZheng').addEventListener('click', () => {
  if (!state.zhengPaid) { openSheet('#sheetZheng'); return; }
  toggleZheng();
});
$('#chatBack').addEventListener('click', () => { $('#subChat').hidden = true; });
$('#chatForm').addEventListener('submit', e => {
  e.preventDefault();
  sendChat($('#chatInput').value);
});
$('#aiRefresh').addEventListener('click', () => {
  state.sugOffset += 1;
  const p = PEOPLE.find(x => x.id === state.chatId);
  const c = chatFor(state.chatId);
  if (p && c) renderSuggestions(c, p);
});
$('#setupBanner').addEventListener('click', openWizard);
$('#prefPortrait').addEventListener('click', openWizard);
$('#mePortrait').addEventListener('click', openWizard);
$('#qwSkip').addEventListener('click', closeWizard);
$('#prefTop').addEventListener('click', () => toast('在下面勾选 3–5 个最在意的点'));
$('#btnFilter').addEventListener('click', () => openSheet('#sheetFilter'));
$('#prefSave').addEventListener('click', () => {
  if (state.prefs.size < 3) { toast('至少选 3 个，才知道你真正在意什么'); return; }
  closeSheet($('#sheetPrefs'));
  toast('已更新心动偏好，推荐会跟着它调整');
});
$('#filterReset').addEventListener('click', () => {
  $$('#filterGroups .qs-filter-chip').forEach(b => b.classList.remove('is-on'));
  $$('#filterGroups .qs-filter-chips').forEach(g => {
    const chips = [...g.querySelectorAll('.qs-filter-chip')];
    const last = chips[chips.length - 1];
    if (last) last.classList.add('is-on');
  });
  state.zheng = false;
  updateZhengUI();
  $('#filterApply').textContent = '开始看推荐';
});
$('#filterApply').addEventListener('click', () => {
  closeSheet($('#sheetFilter'));
  state.i = 0;
  renderCard(true);
  toast(state.zheng ? '已开启正缘筛选，推荐不限次数' : '条件已更新，推荐不限次数');
});
$('#zhengFilterBtn').addEventListener('click', toggleZheng);

$('#btnVip2').addEventListener('click', () => openSheet('#sheetVip'));
$('#btnVip3').addEventListener('click', () => openSheet('#sheetVip'));
$('#meVip').addEventListener('click', () => openSheet('#sheetVip'));
$('#meVerify').addEventListener('click', () => {
  if (state.onboard && state.onboard.verified) toast('实名认证、扫脸认证均已完成');
  else openOnboard(3);
});
$('#meProfile').addEventListener('click', openProfileSheet);
$('#mePoints').addEventListener('click', openPoints);
$('#actBanner').addEventListener('click', openProfileSheet);
$('#pfSave').addEventListener('click', saveProfile);
['#pfBio', '#pfAbout', '#pfExpect'].forEach(sel => {
  const el = $(sel);
  if (el) el.addEventListener('input', updatePfCount);
});
$('#pointsRewards').addEventListener('click', e => {
  const btn = e.target.closest('.pt-btn');
  if (btn) redeemPoint(Number(btn.dataset.cost), btn.dataset.rid);
});
$('#ptInvite').addEventListener('click', () => toast('邀请链接已复制：好友注册后双方各得 200 积分'));
$('#ptDaily').addEventListener('click', ptSignIn);
$('#chatAva').addEventListener('click', () => {
  if (state.chatId) openProfileCard(state.chatId);
});
$$('#vipPlans .qs-plan').forEach(plan => {
  plan.addEventListener('click', () => {
    $$('#vipPlans .qs-plan').forEach(p => p.classList.remove('is-on'));
    plan.classList.add('is-on');
    $('#vipBuy').textContent = `立即开通 ¥${plan.dataset.price}`;
  });
});
$('#vipBuy').addEventListener('click', () => {
  state.vip = true;
  closeSheet($('#sheetVip'));
  $('#meVipState').textContent = '已开通 · 谁喜欢我可见';
  if ($('#screen-likes').classList.contains('is-active')) renderLikes();
  toast('已模拟开通 VIP：谁喜欢我全部可见');
});

$('#zhengBuy').addEventListener('click', () => {
  state.zhengPaid = true;
  state.zheng = true;
  state.i = 0;
  closeSheet($('#sheetZheng'));
  updateZhengUI();
  renderCard(true);
  renderLikes();
  toast('已开通「八字正缘」：接下来只推荐正缘');
});
$('#zhengCloseTip').addEventListener('click', () => {
  closeSheet($('#sheetZheng'));
  toast('已回到全部推荐，正缘可随时在「我的」开通');
});
$('#birthSave').addEventListener('click', saveBirth);
$('#birthNudge').addEventListener('click', openBirthSheet);
$('#birthUnknown').addEventListener('click', () => {
  $('#birthHour').value = '';
  saveBirth();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeAllSheets(); closeMatch(); closeWizard(); $('#subChat').hidden = true; }
});

/* ---------- boot ---------- */
initProfile();
initOnboard();
const bootGender = state.onboard ? state.onboard.gender : 'm';
seedChats(bootGender);
seedLiked();
renderCard(true);
renderPlaza();
renderBubbles();
renderFilters();
renderLikes();
renderMsgList();
refreshSetupUI();
updateZhengUI();
renderPoints();
renderActBanner();
if (state.onboard && !state.profile) setTimeout(openWizard, 1500);
