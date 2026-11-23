import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { BackgroundEffect } from "@/effects/registry";

export type Lang = "zh" | "en";

const STORAGE_KEY = "fx-lang";

function readInitial(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  return "zh";
}

interface EffectCopy {
  name: string;
  desc: string;
}

/** Chinese names and descriptions for all 36 effects. */
const EFFECT_ZH: Record<string, EffectCopy> = {
  "glow-threads": {
    name: "流光丝簇",
    desc: "成束的发光细丝横掠画面，随景深弯曲起伏，在飘移间轻柔呼吸。",
  },
  "ink-halftone": {
    name: "油墨半调",
    desc: "印刷风格的半调网点阵列，圆点半径随行进波浪起伏变化。",
  },
  "comet-cascade": {
    name: "彗星瀑流",
    desc: "彗尾自画面中央倾泻而下，触底时如喷泉溅落玻璃般向两侧弧形散开。",
  },
  "velvet-sweep": {
    name: "天鹅绒掠影",
    desc: "一束弧形光带掠过暗场，丝绸纹理沿带面滑行，其余区域隐入深色。",
  },
  "signal-grid": {
    name: "信号格栅",
    desc: "细密方格静静闪烁，在一侧边缘密集汇聚，向另一侧渐次隐去。",
  },
  "nimbus-twist": {
    name: "光轮旋涡",
    desc: "画面中央呼吸的发光光环；光标靠近时扭结成触须并加速旋转。",
  },
  "dot-bloom": {
    name: "点阵云涌",
    desc: "点阵之上有光云流转：明亮的色块聚拢、变形，在网格间缓缓滑行。",
  },
  "silk-flow": {
    name: "丝绸流韵",
    desc: "满幅丝绸褶皱向侧方缓缓漂移——专为首屏内容铺底的 WebGL 光场。",
  },
  "storm-bolt": {
    name: "雷暴电弧",
    desc: "一道闪电劈落画面，每隔数秒沿全新路径重击，并在驻留时频闪跳动。",
  },
  "glyph-tide": {
    name: "字符潮汐",
    desc: "终端字符密度梯度化作起伏的波浪场。纯文本，纯画布。",
  },
  "aurora-spire": {
    name: "极光塔柱",
    desc: "一道光柱在画面中缓缓攀升，丝质光幕在柱内升腾缠绕。",
  },
  "photon-rush": {
    name: "光子跃迁",
    desc: "超空间跃迁：鲜明的光束自暗核向四周疾驰辐射，浸染调色板色彩。",
  },
  "mist-orb": {
    name: "雾霭光球",
    desc: "缓慢旋转的雾气球体，柔光薄雾层层包裹球面，并在边缘淡淡逸出。",
  },
  "dither-drift": {
    name: "抖动波纹",
    desc: "平滑波浪带经 Bayer 矩阵量化，化作复古的有序抖动纹理。",
  },
  "laser-field": {
    name: "激光矩阵",
    desc: "发光基线上细光束随呼吸起伏，微光火花在暗处缓缓升腾。",
  },
  "mercury-veins": {
    name: "水银脉络",
    desc: "翻涌的液态金属池，炽白脉络在暗色铬面间蜿蜒游走，随光标搅动起波。",
  },
  "horizon-grid": {
    name: "地平线网格",
    desc: "无尽的地面网格向观者滚动而来，在远方地平线处泛起辉光。",
  },
  "echo-rings": {
    name: "回响光环",
    desc: "柔和色环自画面底部弧形升起，色相随波纹向外扩散由核心向边缘流转。",
  },
  "satin-streaks": {
    name: "缎面流光",
    desc: "修长的斜向光迹，如慢摇镜头下的绸缎：宽幅柔光带与细密亮线交叠。",
  },
  "star-surge": {
    name: "星海奔涌",
    desc: "星群自中心奔涌而出：核心处星点闪烁，边缘化作动态模糊的流光。",
  },
  "vapor-ribbons": {
    name: "雾彩丝带",
    desc: "数条宽幅雾感色带蜿蜒穿过画面，每条对应一档配色，全程无硬边。",
  },
  "crest-columns": {
    name: "波峰光柱",
    desc: "纵向渐变光柱阵列，发亮波峰线呈 V 字波浪在各列间翻滚推进。",
  },
  "light-strands": {
    name: "光丝织带",
    desc: "数十根叠加光丝在胶片颗粒下交织成丝滑的渐变光带。",
  },
  "opal-film": {
    name: "蛋白石薄膜",
    desc: "明亮的薄膜干涉虹彩，彩虹边缘勾勒揉捏起伏的力场——集中唯一的日间质感。",
  },
  "pulse-beams": {
    name: "脉冲光束",
    desc: "由纵向光柱构成的整面光墙，每根光柱在柔光晕染下按各自节奏明灭。",
  },
  "marble-flux": {
    name: "流纹云石",
    desc: "温润光泽的流体褶皱慢速揉合翻涌，如摄影棚灯光下倾倒的流光釉面。",
  },
  "shutter-fade": {
    name: "百叶掠光",
    desc: "三色渐变被切分为倾斜百叶，暗场中唯随光标移动的聚光灯逐片点亮叶片。",
  },
  "orbit-trails": {
    name: "星轨环绕",
    desc: "细光弧围绕共同中心旋转，如长曝光下的星轨：内圈疾掠，外圈缓行。",
  },
  "gumball-drop": {
    name: "彩球坠落",
    desc: "光泽彩球在真实 2D 物理驱动下坠入池中堆积，光标掠过即可拨动球群。",
  },
  "veil-rays": {
    name: "薄纱光束",
    desc: "柔和的体积光自上方洒下——有机光束、呼吸光锥与胶片颗粒。",
  },
  "neon-wash": {
    name: "霓虹浸染",
    desc: "如真实霓虹灯管般点火启动：闪烁跳动后光晕自上而下漫染整面墙并锁定常亮。",
  },
  "dusk-filaments": {
    name: "暮色灯丝",
    desc: "层叠霓虹灯丝沿同一条 S 曲线延展，暖色光浪携色散边缘沿丝滑行。",
  },
  "molten-panes": {
    name: "熔铬玻片",
    desc: "纵向玻璃格栅内液态金属缓缓升腾，被配色折映出温润的高光褶皱。",
  },
  "helix-haze": {
    name: "螺旋微雾",
    desc: "细密纤维拧成绳束横贯画面，刻意保持低调克制：是缓转的肌理，而非刺眼灯塔。",
  },
  "dawn-current": {
    name: "破晓暖流",
    desc: "一股柔和光流横贯画面中段，色彩在其中滑行流转，全幅毫无生硬边界。",
  },
  "pixel-pulse": {
    name: "像素脉动",
    desc: "由圆角方格组成的 LED 光墙，自中心向外辐射出干净的同心脉冲环。",
  },
};

const CONTROL_LABEL_ZH: Record<string, string> = {
  Color: "颜色",
  "Color 1": "颜色 1",
  "Color 2": "颜色 2",
  "Color 3": "颜色 3",
  Background: "背景色",
  Speed: "速度",
  Threads: "光丝数",
  Trails: "彗尾数",
  Anchor: "密集侧",
  Density: "密度",
  Characters: "字符集",
  Streaks: "光束数",
  Beams: "光柱数",
  Stars: "星点数",
  Columns: "列数",
  Blinds: "叶片数",
  Balls: "球数",
  Panes: "玻片数",
};

const SEGMENT_VALUE_ZH: Record<string, string> = {
  left: "左侧",
  right: "右侧",
};

const PROP_DESC_ZH: Record<string, string> = {
  "Three-stop palette. Each entry accepts a hex or a var(--token) reference.":
    "三色渐变调色板。每项支持十六进制色值或 var(--token) 变量。",
  "Canvas fill behind the effect.": "效果背后的画布填充底色。",
  "Animation speed multiplier.": "动画速度倍率。",
  "Threads per bundle (3 to 14).": "每束光丝的数量（3 至 14）。",
  "Effect color. Accepts a hex or a var(--token) reference.":
    "效果主色。支持十六进制色值或 var(--token) 变量。",
  "Number of comet trails in the cascade.": "瀑布中的彗尾数量。",
  "Edge the dense squares anchor to; the grid fades toward the other side.":
    "方格密集停靠的一侧，向另一侧渐隐。",
  "Grid density: dot columns across the width.": "网格密度：横向圆点列数。",
  "Glyph density ramp, sparse to dense.": "字符密度梯度，由疏到密排列。",
  "Number of streaks in the jump.": "跃迁中的光束数量。",
  "Number of beams; sparks scale along.": "激光束数量，火花数量随之缩放。",
  "Number of stars in the field.": "星场中的星点数量。",
  "Number of columns across the width.": "横向光柱列数。",
  "Number of beams across the width.": "横向脉冲光柱数量。",
  "Number of blinds across the frame.": "画面中的百叶窗叶片数量。",
  "Number of orbit trails.": "环绕星轨的数量。",
  "Number of balls in the pit.": "球池中的彩球数量。",
  "Number of panes across the width.": "横向玻璃格栅数量。",
  "Grid density: LED columns across the width.": "网格密度：横向 LED 列数。",
};

const UI = {
  zh: {
    title: "动态背景效果集",
    effectsCount: (n: number) => `${n} 款效果`,
    subtitle:
      "放在首屏、页脚或任意区块背后。颜色、速度、氛围皆可即时调节——选一款效果，直接复制单文件组件即可使用。",
    extractedFrom: "提取自",
    heroMeta: "36 款效果原样保留 · 实时渲染 · 每次进入随机展示首屏背景",
    heroBadgeLabel: "当前首屏背景",
    shuffleHero: "换一款",
    gallery: "画廊",
    studio: "工作台",
    backToGallery: "画廊",
    filterAll: "全部",
    filterWebgl: "WebGL",
    filterCanvas: "Canvas 2D",
    galleryHint: "每次进入随机变换排列 · 点击卡片进入工作台调色与导出",
    shuffleOrder: "随机排序",
    openEffect: "打开 ↗",
    sidebarTitle: "效果列表",
    sidebarSub: "共 36 款可实时调节的动态背景。",
    backgroundsCrumb: "动态背景",
    heroOverlayOn: "示例前景 · 开",
    heroOverlayOff: "示例前景 · 关",
    fullscreen: "全屏预览 ⤢",
    keyHint: "← → 键切换效果",
    customize: "参数调节",
    reset: "重置",
    propsTitle: "组件属性",
    defaultLabel: "默认值",
    usageTitle: "使用方式",
    zeroDepBadge: "零依赖 · 仅 React · 单文件 · 复制即用",
    tabUsage: "使用示例",
    tabSource: (lines: number) => `组件源码 · ${lines} 行`,
    usageDesc: (file: string) =>
      `按上方参数实时生成。把 ${file} 复制到项目里即可运行，无需安装任何依赖。`,
    sourceDesc: "完整的单文件组件：内置渲染引擎，只依赖 React。属性带类型，改颜色、速度即可。",
    download: "下载",
    copy: "复制",
    copied: "已复制",
    prevEffect: "上一个效果",
    nextEffect: "下一个效果",
    exitFullscreen: "退出全屏",
    themeGroup: "外观主题",
    themeAuto: "跟随系统",
    themeLight: "浅色模式",
    themeDark: "深色模式",
    langLabel: "语言",
    overlayBrand: "网站启动套件",
    overlayNav: ["功能", "定价", "文档"] as const,
    overlaySignUp: "注册",
    overlayPill: "新品 · AI 原生启动套件",
    overlayTitle1: "从第一句提示词开始",
    overlayTitleAccent: "构建你的 Web 应用",
    overlayTitle2: "。",
    overlayDesc: "专为 AI 编程工具打造的生产级启动套件。",
    overlayPrimary: "获取永久授权",
    overlaySecondary: "查看演示 →",
  },
  en: {
    title: "Animated Backgrounds",
    effectsCount: (n: number) => `${n} Effects`,
    subtitle:
      "Put one behind your hero, your footer, or any section. Tune colors, speed, and mood live — then copy the single-file component.",
    extractedFrom: "Extracted from",
    heroMeta: "36 effects preserved verbatim · live rendered · randomized on every visit",
    heroBadgeLabel: "Hero background",
    shuffleHero: "Shuffle",
    gallery: "Gallery",
    studio: "Studio",
    backToGallery: "Gallery",
    filterAll: "All",
    filterWebgl: "WebGL",
    filterCanvas: "Canvas 2D",
    galleryHint: "Shuffled on every visit · click any card to customize & export",
    shuffleOrder: "Shuffle",
    openEffect: "Open ↗",
    sidebarTitle: "Effects",
    sidebarSub: "Animated effects included in the pack.",
    backgroundsCrumb: "Backgrounds",
    heroOverlayOn: "Hero · On",
    heroOverlayOff: "Hero · Off",
    fullscreen: "Fullscreen ⤢",
    keyHint: "← → to switch effects",
    customize: "Customize",
    reset: "Reset",
    propsTitle: "Props",
    defaultLabel: "default",
    usageTitle: "Usage",
    zeroDepBadge: "Zero deps · React only · single file · copy & use",
    tabUsage: "Usage example",
    tabSource: (lines: number) => `Component source · ${lines} lines`,
    usageDesc: (file: string) =>
      `Generated live from the controls above. Drop ${file} into your project — no extra packages needed.`,
    sourceDesc:
      "Complete single-file component with the rendering engine inlined. Only React is required.",
    download: "Download",
    copy: "Copy",
    copied: "Copied",
    prevEffect: "Previous effect",
    nextEffect: "Next effect",
    exitFullscreen: "Exit fullscreen",
    themeGroup: "Theme",
    themeAuto: "System",
    themeLight: "Light",
    themeDark: "Dark",
    langLabel: "Language",
    overlayBrand: "Website Starter Kit",
    overlayNav: ["Features", "Pricing", "Docs"] as const,
    overlaySignUp: "Sign up",
    overlayPill: "New · agent-ready starter kit",
    overlayTitle1: "Build your ",
    overlayTitleAccent: "web app",
    overlayTitle2: " from the first prompt.",
    overlayDesc: "A production-ready starter kit built for AI coding tools.",
    overlayPrimary: "Get lifetime access",
    overlaySecondary: "See demo →",
  },
} as const;

export type UiCopy = (typeof UI)[Lang];

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: UiCopy;
  effectName: (effect: BackgroundEffect) => string;
  effectSubName: (effect: BackgroundEffect) => string | null;
  effectDesc: (effect: BackgroundEffect) => string;
  controlLabel: (label: string) => string;
  segmentLabel: (option: string) => string;
  propDesc: (desc: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const effectName = useCallback(
    (effect: BackgroundEffect) =>
      lang === "zh" ? (EFFECT_ZH[effect.id]?.name ?? effect.name) : effect.name,
    [lang],
  );

  const effectSubName = useCallback(
    (effect: BackgroundEffect) => (lang === "zh" ? effect.name : null),
    [lang],
  );

  const effectDesc = useCallback(
    (effect: BackgroundEffect) =>
      lang === "zh" ? (EFFECT_ZH[effect.id]?.desc ?? effect.desc) : effect.desc,
    [lang],
  );

  const controlLabel = useCallback(
    (label: string) => (lang === "zh" ? (CONTROL_LABEL_ZH[label] ?? label) : label),
    [lang],
  );

  const segmentLabel = useCallback(
    (option: string) => (lang === "zh" ? (SEGMENT_VALUE_ZH[option] ?? option) : option),
    [lang],
  );

  const propDesc = useCallback(
    (desc: string) => (lang === "zh" ? (PROP_DESC_ZH[desc] ?? desc) : desc),
    [lang],
  );

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        t: UI[lang],
        effectName,
        effectSubName,
        effectDesc,
        controlLabel,
        segmentLabel,
        propDesc,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
