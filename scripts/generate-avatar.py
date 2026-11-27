#!/usr/bin/env python3
"""生成同频小程序头像（144x144 PNG）。

设计：品牌玫粉渐变底 + 两条白色共振波纹在中心同频汇聚成一个圆点。
"同频"= 两个波形对齐共振；极简几何，144px 下清晰可辨。
纯 PIL 绘制，4x 超采样抗锯齿，无外部素材依赖。
"""
import math
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "assets", "avatar", "tongpin-avatar-144.png")
S = 4                      # 超采样倍数
N = 144 * S                # 渲染分辨率
CX = CY = N / 2


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build():
    img = Image.new("RGB", (N, N))
    d = ImageDraw.Draw(img)

    # 对角渐变底：亮玫粉 → 深玫粉
    c0, c1 = (255, 112, 163), (224, 49, 116)
    for y in range(N):
        for x in range(N):
            t = (x + y) / (2 * N)
            d.point((x, y), fill=lerp(c0, c1, t))

    # 圆角方形白色描边（让图标在微信圆形裁切下仍有完整边界感）
    pad = int(N * 0.10)
    corner = int(N * 0.24)
    d.rounded_rectangle([pad, pad, N - pad, N - pad], radius=corner,
                        outline=(255, 255, 255, 235), width=int(N * 0.022))

    # 同心涟漪弧：中心点向外扩散的两圈弧，经典"同频/共振信号"视觉语言。
    # 缺口留在左右两侧，弧分布在上下，形成 ((•)) 的对称共振感，144px 下极清晰。
    lw = int(N * 0.027)
    for radius, a0, a1 in (
        (N * 0.105, 35, 145), (N * 0.105, 215, 325),
        (N * 0.185, 35, 145), (N * 0.185, 215, 325),
    ):
        box = [int(CX - radius), int(CY - radius), int(CX + radius), int(CY + radius)]
        d.arc(box, start=a0, end=a1, fill=(255, 255, 255), width=lw)

    # 中心汇聚点：白色实心圆，象征"同频那一刻"
    r = N * 0.045
    d.ellipse([int(CX - r), int(CY - r), int(CX + r), int(CY + r)], fill=(255, 255, 255))

    # 缩到目标尺寸（LANCZOS 抗锯齿）
    out = img.resize((144, 144), Image.LANCZOS)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out.save(OUT, "PNG", optimize=True)
    print(OUT)


if __name__ == "__main__":
    build()
