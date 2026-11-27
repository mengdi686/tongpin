// 同频 · 小程序分享卡片生成
// 纯 canvas 2d 程序化绘制，不依赖任何图片资源；字体/坐标与 H5 分享卡一致。
// 只含好奇文案、同频占比、风格词、动物名与免责；无生辰、无配对断言、无禁用词。

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = String(text).split('');
  let line = '';
  let yy = y;
  for (let i = 0; i < chars.length; i += 1) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = chars[i];
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

// 在页面内创建一个隐藏的 2d canvas 节点，绘制后导出临时文件路径。
// 需要在 wxml 中放置 <canvas type="2d" id="shareCard" class="share-canvas-hidden" />。
function renderShareCard(page, result, hook, animal) {
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(page)
      .select('#shareCard')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) return resolve('');
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const W = 640;
        const H = 1120;
        canvas.width = W;
        canvas.height = H;

        ctx.fillStyle = '#fff5f8';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff4d8d';
        ctx.fillRect(0, 0, W, 12);

        ctx.fillStyle = '#221c23';
        ctx.font = '500 40px sans-serif';
        ctx.fillText('同频 · 先了解自己，再认真相遇', 40, 92);
        ctx.fillStyle = '#e63a77';
        ctx.font = 'bold 42px sans-serif';
        wrap(ctx, hook, 40, 176, 560, 58);

        ctx.fillStyle = '#e63a77';
        ctx.font = '500 46px sans-serif';
        ctx.fillText('约 ' + result.resonance + '% 的人与你同频', 40, 372);
        ctx.fillStyle = '#948b93';
        ctx.font = '21px sans-serif';
        ctx.fillText('风格相近的人群占比 · 仅供娱乐参考', 40, 412);
        ctx.fillStyle = '#221c23';
        ctx.font = '500 28px sans-serif';
        (result.styles || []).slice(0, 3).forEach((s, i) => ctx.fillText('· ' + s, 40, 470 + i * 46));

        const cx = 320;
        const cy = 672;
        ctx.fillStyle = '#ffd9e6';
        ctx.beginPath();
        ctx.arc(cx, cy, 96, 0, Math.PI * 2);
        ctx.fill();
        if (animal) {
          ctx.fillStyle = '#e63a77';
          ctx.font = '500 34px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('我的同频小动物', cx, cy + 12);
          ctx.fillStyle = '#221c23';
          ctx.font = 'bold 44px sans-serif';
          ctx.fillText(animal.name, cx, cy + 66);
          ctx.textAlign = 'left';
        }
        ctx.fillStyle = '#221c23';
        ctx.font = '500 25px sans-serif';
        if (animal) wrap(ctx, animal.name + '：' + animal.line, 40, cy + 132, 560, 34);
        ctx.fillStyle = '#948b93';
        ctx.font = '18px sans-serif';
        ctx.fillText('按分数段随机出场，纯图一乐，和性格结论无关。', 40, cy + 204);

        ctx.fillStyle = '#221c23';
        ctx.font = '25px sans-serif';
        ctx.fillText((result.care || [])[0] || '', 40, cy + 248);
        ctx.fillText((result.care || [])[1] || '', 40, cy + 284);

        ctx.fillStyle = '#948b93';
        ctx.font = '18px sans-serif';
        ctx.fillText('本测评为传统文化视角的自我了解工具，仅供娱乐参考。', 40, 1028);
        ctx.fillText('不是心理诊断，不构成婚恋建议，不代表关系成功概率。', 40, 1054);

        wx.canvasToTempFilePath({
          canvas,
          x: 0,
          y: 0,
          width: W,
          height: H,
          destWidth: W,
          destHeight: H,
          fileType: 'png',
          success: (r) => resolve(r.tempFilePath || ''),
          fail: () => resolve(''),
        });
      });
  });
}

module.exports = { renderShareCard };
