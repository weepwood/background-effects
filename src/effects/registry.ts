import * as React from "react";
import type { ReactElement } from "react";
import { GlowThreads, type GlowThreadsProps } from "./fx/glow-threads";
import { InkHalftone, type InkHalftoneProps } from "./fx/ink-halftone";
import { CometCascade, type CometCascadeProps } from "./fx/comet-cascade";
import { VelvetSweep, type VelvetSweepProps } from "./fx/velvet-sweep";
import { SignalGrid, type SignalGridProps } from "./fx/signal-grid";
import { NimbusTwist, type NimbusTwistProps } from "./fx/nimbus-twist";
import { DotBloom, type DotBloomProps } from "./fx/dot-bloom";
import { SilkFlow, type SilkFlowProps } from "./fx/silk-flow";
import { StormBolt, type StormBoltProps } from "./fx/storm-bolt";
import { GlyphTide, type GlyphTideProps } from "./fx/glyph-tide";
import { AuroraSpire, type AuroraSpireProps } from "./fx/aurora-spire";
import { PhotonRush, type PhotonRushProps } from "./fx/photon-rush";
import { MistOrb, type MistOrbProps } from "./fx/mist-orb";
import { DitherDrift, type DitherDriftProps } from "./fx/dither-drift";
import { LaserField, type LaserFieldProps } from "./fx/laser-field";
import { MercuryVeins, type MercuryVeinsProps } from "./fx/mercury-veins";
import { HorizonGrid, type HorizonGridProps } from "./fx/horizon-grid";
import { EchoRings, type EchoRingsProps } from "./fx/echo-rings";
import { SatinStreaks, type SatinStreaksProps } from "./fx/satin-streaks";
import { StarSurge, type StarSurgeProps } from "./fx/star-surge";
import { VaporRibbons, type VaporRibbonsProps } from "./fx/vapor-ribbons";
import { CrestColumns, type CrestColumnsProps } from "./fx/crest-columns";
import { LightStrands, type LightStrandsProps } from "./fx/light-strands";
import { OpalFilm, type OpalFilmProps } from "./fx/opal-film";
import { PulseBeams, type PulseBeamsProps } from "./fx/pulse-beams";
import { MarbleFlux, type MarbleFluxProps } from "./fx/marble-flux";
import { ShutterFade, type ShutterFadeProps } from "./fx/shutter-fade";
import { OrbitTrails, type OrbitTrailsProps } from "./fx/orbit-trails";
import { GumballDrop, type GumballDropProps } from "./fx/gumball-drop";
import { VeilRays, type VeilRaysProps } from "./fx/veil-rays";
import { NeonWash, type NeonWashProps } from "./fx/neon-wash";
import { DuskFilaments, type DuskFilamentsProps } from "./fx/dusk-filaments";
import { MoltenPanes, type MoltenPanesProps } from "./fx/molten-panes";
import { HelixHaze, type HelixHazeProps } from "./fx/helix-haze";
import { DawnCurrent, type DawnCurrentProps } from "./fx/dawn-current";
import { PixelPulse, type PixelPulseProps } from "./fx/pixel-pulse";

/** Accent color of the original getdesign.md dark theme. */
export const ACCENT = "#ceff00";

export type EffectValue = string | number;
export type EffectValues = Record<string, EffectValue>;

export interface EffectProp {
  prop: string;
  type: string;
  def: string;
  desc: string;
}

export type EffectControl =
  | { key: string; label: string; kind: "color" }
  | { key: string; label: string; kind: "text" }
  | { key: string; label: string; kind: "range"; min: number; max: number; step: number }
  | { key: string; label: string; kind: "segment"; options: string[] };

export interface BackgroundEffect {
  id: string;
  name: string;
  tech: "webgl" | "canvas-2d";
  /** PascalCase component name exported from ./fx/<id>.tsx */
  component: string;
  desc: string;
  /** Position on the original page, e.g. "/01". */
  index: string;
  props: EffectProp[];
  defaults: EffectValues;
  controls: EffectControl[];
  render: (values: EffectValues) => ReactElement;
}

/** Map control values to component props (c0/c1/c2 → colors). */
function toProps<T>(values: EffectValues): T {
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === "c0" || key === "c1" || key === "c2") continue;
    props[key] = value;
  }
  if ("c0" in values) props.colors = [values.c0, values.c1, values.c2];
  return props as T;
}

export const BACKGROUNDS: BackgroundEffect[] = [
  {
    id: "glow-threads",
    name: "Glow Threads",
    tech: "webgl",
    component: "GlowThreads",
    desc: "Bundles of luminous threads drifting across the frame, each fan bending with distance and breathing as it goes.",
    index: "/01",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "9",
        "desc": "Threads per bundle (3 to 14)."
      }
    ],
    defaults:     {
      "c0": "#e86bd8",
      "c1": "#f5f0fa",
      "c2": "#8b5bd6",
      "background": "#0f1013",
      "speed": 1,
      "count": 9
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Threads",
        "kind": "range",
        "min": 3,
        "max": 14,
        "step": 1
      }
    ],
    render: (v) => React.createElement(GlowThreads, toProps<GlowThreadsProps>(v)),
  },
  {
    id: "ink-halftone",
    name: "Ink Halftone",
    tech: "canvas-2d",
    component: "InkHalftone",
    desc: "Print-style halftone dots, their radius modulated by a travelling wave.",
    index: "/02",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#cfd3da",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(InkHalftone, toProps<InkHalftoneProps>(v)),
  },
  {
    id: "comet-cascade",
    name: "Comet Cascade",
    tech: "canvas-2d",
    component: "CometCascade",
    desc: "Comet trails pouring down the center, banking outward near the floor like a fountain hitting glass.",
    index: "/03",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "36",
        "desc": "Number of comet trails in the cascade."
      }
    ],
    defaults:     {
      "c0": "#5b4bd8",
      "c1": "#9b3fd4",
      "c2": "#e04fae",
      "background": "#0f1013",
      "speed": 1,
      "count": 36
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Trails",
        "kind": "range",
        "min": 18,
        "max": 63,
        "step": 9
      }
    ],
    render: (v) => React.createElement(CometCascade, toProps<CometCascadeProps>(v)),
  },
  {
    id: "velvet-sweep",
    name: "Velvet Sweep",
    tech: "webgl",
    component: "VelvetSweep",
    desc: "One curved ribbon of glowing cloth sweeping the frame, silk striations sliding along it, the rest left dark.",
    index: "/04",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#3230e0",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(VelvetSweep, toProps<VelvetSweepProps>(v)),
  },
  {
    id: "signal-grid",
    name: "Signal Grid",
    tech: "canvas-2d",
    component: "SignalGrid",
    desc: "A fine grid of squares that quietly twinkle, dense at one edge and fading to empty.",
    index: "/05",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "anchor",
        "type": "'left' | 'right'",
        "def": "'left'",
        "desc": "Edge the dense squares anchor to; the grid fades toward the other side."
      }
    ],
    defaults:     {
      "color": "#a9aeb6",
      "background": "#0f1013",
      "speed": 1,
      "anchor": "left"
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "anchor",
        "label": "Anchor",
        "kind": "segment",
        "options": [
          "left",
          "right"
        ]
      }
    ],
    render: (v) => React.createElement(SignalGrid, toProps<SignalGridProps>(v)),
  },
  {
    id: "nimbus-twist",
    name: "Nimbus Twist",
    tech: "webgl",
    component: "NimbusTwist",
    desc: "A luminous halo breathing at center frame; bring the cursor near and it squirms into tendrils and spins faster.",
    index: "/06",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#9c43fe",
      "c1": "#4cc2e9",
      "c2": "#141980",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(NimbusTwist, toProps<NimbusTwistProps>(v)),
  },
  {
    id: "dot-bloom",
    name: "Dot Bloom",
    tech: "canvas-2d",
    component: "DotBloom",
    desc: "A halftone dot matrix under drifting weather: cloud patches of light form, morph, and slide across the grid.",
    index: "/07",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "density",
        "type": "number",
        "def": "40",
        "desc": "Grid density: dot columns across the width."
      }
    ],
    defaults:     {
      "color": "#d4d8e0",
      "background": "#0f1013",
      "speed": 1,
      "density": 40
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "density",
        "label": "Density",
        "kind": "range",
        "min": 24,
        "max": 64,
        "step": 2
      }
    ],
    render: (v) => React.createElement(DotBloom, toProps<DotBloomProps>(v)),
  },
  {
    id: "silk-flow",
    name: "Silk Flow",
    tech: "webgl",
    component: "SilkFlow",
    desc: "Full-bleed silk folds drifting sideways — a WebGL field made to sit behind hero content.",
    index: "/08",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#767676",
      "c1": "#f2f4f8",
      "c2": "#a6abb4",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(SilkFlow, toProps<SilkFlowProps>(v)),
  },
  {
    id: "storm-bolt",
    name: "Storm Bolt",
    tech: "webgl",
    component: "StormBolt",
    desc: "One bolt of lightning crackling down the frame: it re-strikes on a new path every few seconds and strobes as it holds.",
    index: "/09",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#b48cf2",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(StormBolt, toProps<StormBoltProps>(v)),
  },
  {
    id: "glyph-tide",
    name: "Glyph Tide",
    tech: "canvas-2d",
    component: "GlyphTide",
    desc: "A terminal glyph ramp breathing as a wave field. Pure text, pure canvas.",
    index: "/10",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "characters",
        "type": "string",
        "def": "' .:-+*=%@#'",
        "desc": "Glyph density ramp, sparse to dense."
      }
    ],
    defaults:     {
      "color": "#b8bdc6",
      "background": "#0f1013",
      "speed": 1,
      "characters": " .:-+*=%@#"
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "characters",
        "label": "Characters",
        "kind": "text"
      }
    ],
    render: (v) => React.createElement(GlyphTide, toProps<GlyphTideProps>(v)),
  },
  {
    id: "aurora-spire",
    name: "Aurora Spire",
    tech: "webgl",
    component: "AuroraSpire",
    desc: "A slow column of light climbing through the frame, silky veils rising and wrapping inside it.",
    index: "/11",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#6d4df2",
      "c1": "#f27dd7",
      "c2": "#f4ecff",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(AuroraSpire, toProps<AuroraSpireProps>(v)),
  },
  {
    id: "photon-rush",
    name: "Photon Rush",
    tech: "canvas-2d",
    component: "PhotonRush",
    desc: "A hyperspace jump: bold light streaks racing radially out of a dark core, tinted from the palette.",
    index: "/12",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "90",
        "desc": "Number of streaks in the jump."
      }
    ],
    defaults:     {
      "c0": "#8f7bff",
      "c1": "#f2f4f8",
      "c2": "#b48cf2",
      "background": "#0f1013",
      "speed": 1,
      "count": 90
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Streaks",
        "kind": "range",
        "min": 40,
        "max": 160,
        "step": 10
      }
    ],
    render: (v) => React.createElement(PhotonRush, toProps<PhotonRushProps>(v)),
  },
  {
    id: "mist-orb",
    name: "Mist Orb",
    tech: "webgl",
    component: "MistOrb",
    desc: "A sphere of slow-turning fog: wisps wrap the globe in soft layers and spill faintly past the limb.",
    index: "/13",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#c936ae",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(MistOrb, toProps<MistOrbProps>(v)),
  },
  {
    id: "dither-drift",
    name: "Dither Drift",
    tech: "canvas-2d",
    component: "DitherDrift",
    desc: "Smooth wave bands quantized through a Bayer matrix into retro ordered dither.",
    index: "/14",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#878d96",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(DitherDrift, toProps<DitherDriftProps>(v)),
  },
  {
    id: "laser-field",
    name: "Laser Field",
    tech: "canvas-2d",
    component: "LaserField",
    desc: "A glowing laser baseline with thin beams breathing out of it and sparks drifting up through the dark.",
    index: "/15",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "70",
        "desc": "Number of beams; sparks scale along."
      }
    ],
    defaults:     {
      "color": "#d945c8",
      "background": "#0f1013",
      "speed": 1,
      "count": 70
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Beams",
        "kind": "range",
        "min": 30,
        "max": 120,
        "step": 5
      }
    ],
    render: (v) => React.createElement(LaserField, toProps<LaserFieldProps>(v)),
  },
  {
    id: "mercury-veins",
    name: "Mercury Veins",
    tech: "webgl",
    component: "MercuryVeins",
    desc: "A churning pool of liquid metal, white-hot veins snaking through dark chrome, and the cursor stirs it.",
    index: "/16",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#e6e6ec",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(MercuryVeins, toProps<MercuryVeinsProps>(v)),
  },
  {
    id: "horizon-grid",
    name: "Horizon Grid",
    tech: "canvas-2d",
    component: "HorizonGrid",
    desc: "An endless floor grid scrolling toward the viewer, glowing at the horizon.",
    index: "/17",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#c0c5cd",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(HorizonGrid, toProps<HorizonGridProps>(v)),
  },
  {
    id: "echo-rings",
    name: "Echo Rings",
    tech: "webgl",
    component: "EchoRings",
    desc: "Soft color loops arcing up from below the frame, hue drifting from core to rim as the bands ripple outward.",
    index: "/18",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#4130d6",
      "c1": "#8d2fd0",
      "c2": "#d62a55",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(EchoRings, toProps<EchoRingsProps>(v)),
  },
  {
    id: "satin-streaks",
    name: "Satin Streaks",
    tech: "webgl",
    component: "SatinStreaks",
    desc: "Long diagonal light trails, like satin caught in a slow pan: broad soft bands under a fine sparkle of thin lines.",
    index: "/19",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#aeb6c4",
      "c1": "#f4f2ee",
      "c2": "#d9c1a0",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(SatinStreaks, toProps<SatinStreaksProps>(v)),
  },
  {
    id: "star-surge",
    name: "Star Surge",
    tech: "canvas-2d",
    component: "StarSurge",
    desc: "A starfield rushing out from center: twinkling points in the core, motion-blur streaks at the rim.",
    index: "/20",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "260",
        "desc": "Number of stars in the field."
      }
    ],
    defaults:     {
      "color": "#c9cfe6",
      "background": "#0f1013",
      "speed": 1,
      "count": 260
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Stars",
        "kind": "range",
        "min": 100,
        "max": 500,
        "step": 20
      }
    ],
    render: (v) => React.createElement(StarSurge, toProps<StarSurgeProps>(v)),
  },
  {
    id: "vapor-ribbons",
    name: "Vapor Ribbons",
    tech: "webgl",
    component: "VaporRibbons",
    desc: "A few wide, misty bands of color snaking across the frame, one palette stop per ribbon, no hard edges anywhere.",
    index: "/21",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#a86df2",
      "c1": "#d66de0",
      "c2": "#6d5df2",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(VaporRibbons, toProps<VaporRibbonsProps>(v)),
  },
  {
    id: "crest-columns",
    name: "Crest Columns",
    tech: "canvas-2d",
    component: "CrestColumns",
    desc: "Vertical gradient bars, each with a glowing crest line rolling on a V-shaped wave across the columns.",
    index: "/22",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "16",
        "desc": "Number of columns across the width."
      }
    ],
    defaults:     {
      "color": "#dde1ea",
      "background": "#0f1013",
      "speed": 1,
      "count": 16
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Columns",
        "kind": "range",
        "min": 8,
        "max": 28,
        "step": 1
      }
    ],
    render: (v) => React.createElement(CrestColumns, toProps<CrestColumnsProps>(v)),
  },
  {
    id: "light-strands",
    name: "Light Strands",
    tech: "canvas-2d",
    component: "LightStrands",
    desc: "Dozens of additive light strands weaving a silky gradient ribbon under film grain.",
    index: "/23",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#767676",
      "c1": "#f2f4f8",
      "c2": "#a6abb4",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(LightStrands, toProps<LightStrandsProps>(v)),
  },
  {
    id: "opal-film",
    name: "Opal Film",
    tech: "webgl",
    component: "OpalFilm",
    desc: "A bright sheet of thin-film iridescence, rainbow fringes tracing a kneading field: the one daylight surface in the set.",
    index: "/24",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#8099cc",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(OpalFilm, toProps<OpalFilmProps>(v)),
  },
  {
    id: "pulse-beams",
    name: "Pulse Beams",
    tech: "webgl",
    component: "PulseBeams",
    desc: "A wall of vertical light columns, each flickering on its own tempo under soft bloom.",
    index: "/25",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "16",
        "desc": "Number of beams across the width."
      }
    ],
    defaults:     {
      "color": "#d6dbe4",
      "background": "#0f1013",
      "speed": 1,
      "count": 16
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Beams",
        "kind": "range",
        "min": 6,
        "max": 28,
        "step": 1
      }
    ],
    render: (v) => React.createElement(PulseBeams, toProps<PulseBeamsProps>(v)),
  },
  {
    id: "marble-flux",
    name: "Marble Flux",
    tech: "webgl",
    component: "MarbleFlux",
    desc: "Glossy fluid folds kneading themselves in slow motion, like poured gloss under studio light.",
    index: "/26",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#cc16c2",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(MarbleFlux, toProps<MarbleFluxProps>(v)),
  },
  {
    id: "shutter-fade",
    name: "Shutter Fade",
    tech: "webgl",
    component: "ShutterFade",
    desc: "A three-stop gradient sliced into tilted blinds, dark until a cursor-following spotlight lifts the slats it crosses.",
    index: "/27",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "14",
        "desc": "Number of blinds across the frame."
      }
    ],
    defaults:     {
      "c0": "#f28ae0",
      "c1": "#8a5cf2",
      "c2": "#4632d8",
      "background": "#0f1013",
      "speed": 1,
      "count": 14
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Blinds",
        "kind": "range",
        "min": 6,
        "max": 24,
        "step": 1
      }
    ],
    render: (v) => React.createElement(ShutterFade, toProps<ShutterFadeProps>(v)),
  },
  {
    id: "orbit-trails",
    name: "Orbit Trails",
    tech: "canvas-2d",
    component: "OrbitTrails",
    desc: "Thin arcs of light circling a shared center, like star trails in a long exposure: inner orbits whip, outer ones glide.",
    index: "/28",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "80",
        "desc": "Number of orbit trails."
      }
    ],
    defaults:     {
      "c0": "#8f7bff",
      "c1": "#5b6cff",
      "c2": "#c96af2",
      "background": "#0f1013",
      "speed": 1,
      "count": 80
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Trails",
        "kind": "range",
        "min": 40,
        "max": 140,
        "step": 10
      }
    ],
    render: (v) => React.createElement(OrbitTrails, toProps<OrbitTrailsProps>(v)),
  },
  {
    id: "gumball-drop",
    name: "Gumball Drop",
    tech: "canvas-2d",
    component: "GumballDrop",
    desc: "Glossy balls tumbling into a pit under real 2D physics, and the cursor shoulders through the pile.",
    index: "/29",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "count",
        "type": "number",
        "def": "26",
        "desc": "Number of balls in the pit."
      }
    ],
    defaults:     {
      "c0": "#4c3ff2",
      "c1": "#f0f0f4",
      "c2": "#5c5a66",
      "background": "#0f1013",
      "speed": 1,
      "count": 26
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "count",
        "label": "Balls",
        "kind": "range",
        "min": 10,
        "max": 50,
        "step": 2
      }
    ],
    render: (v) => React.createElement(GumballDrop, toProps<GumballDropProps>(v)),
  },
  {
    id: "veil-rays",
    name: "Veil Rays",
    tech: "webgl",
    component: "VeilRays",
    desc: "Soft volumetric light falling from above — organic beams, a breathing cone, and film grain.",
    index: "/30",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#dde3ec",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(VeilRays, toProps<VeilRaysProps>(v)),
  },
  {
    id: "neon-wash",
    name: "Neon Wash",
    tech: "webgl",
    component: "NeonWash",
    desc: "A neon tube igniting like a real one: sputtering flashes, the wash filling the wall top to bottom, then locking on.",
    index: "/31",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#a855f7",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(NeonWash, toProps<NeonWashProps>(v)),
  },
  {
    id: "dusk-filaments",
    name: "Dusk Filaments",
    tech: "webgl",
    component: "DuskFilaments",
    desc: "Stacked neon filaments riding one shared S-curve, a warm sweep gliding along them with a chromatic fringe.",
    index: "/32",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#4638d8",
      "c1": "#f04fd0",
      "c2": "#f2ecff",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(DuskFilaments, toProps<DuskFilamentsProps>(v)),
  },
  {
    id: "molten-panes",
    name: "Molten Panes",
    tech: "webgl",
    component: "MoltenPanes",
    desc: "Vertical glass panes filled with slow-rising liquid chrome, creased into glossy folds by the palette.",
    index: "/33",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "panes",
        "type": "number",
        "def": "6",
        "desc": "Number of panes across the width."
      }
    ],
    defaults:     {
      "c0": "#4c1d95",
      "c1": "#a855f7",
      "c2": "#e879f9",
      "background": "#0f1013",
      "speed": 1,
      "panes": 6
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "panes",
        "label": "Panes",
        "kind": "range",
        "min": 3,
        "max": 10,
        "step": 1
      }
    ],
    render: (v) => React.createElement(MoltenPanes, toProps<MoltenPanesProps>(v)),
  },
  {
    id: "helix-haze",
    name: "Helix Haze",
    tech: "webgl",
    component: "HelixHaze",
    desc: "A rope of fine fibers twisted across the frame, deliberately dim: a slow-turning texture, not a beacon.",
    index: "/34",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "color": "#c084fc",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(HelixHaze, toProps<HelixHazeProps>(v)),
  },
  {
    id: "dawn-current",
    name: "Dawn Current",
    tech: "webgl",
    component: "DawnCurrent",
    desc: "One soft current of light flowing across mid-frame, hues sliding through it, no hard edge in the whole frame.",
    index: "/35",
    props:     [
      {
        "prop": "colors",
        "type": "string[]",
        "def": "['#767676', '#f2f4f8', '#a6abb4']",
        "desc": "Three-stop palette. Each entry accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      }
    ],
    defaults:     {
      "c0": "#5b8af2",
      "c1": "#a86df2",
      "c2": "#f25b9e",
      "background": "#0f1013",
      "speed": 1
    },
    controls:     [
      {
        "key": "c0",
        "label": "Color 1",
        "kind": "color"
      },
      {
        "key": "c1",
        "label": "Color 2",
        "kind": "color"
      },
      {
        "key": "c2",
        "label": "Color 3",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      }
    ],
    render: (v) => React.createElement(DawnCurrent, toProps<DawnCurrentProps>(v)),
  },
  {
    id: "pixel-pulse",
    name: "Pixel Pulse",
    tech: "canvas-2d",
    component: "PixelPulse",
    desc: "An LED wall of rounded square cells pulsing as clean concentric rings radiating from the center.",
    index: "/36",
    props:     [
      {
        "prop": "color",
        "type": "string",
        "def": "var(--color-accent)",
        "desc": "Effect color. Accepts a hex or a var(--token) reference."
      },
      {
        "prop": "background",
        "type": "string",
        "def": "var(--color-fx-canvas)",
        "desc": "Canvas fill behind the effect."
      },
      {
        "prop": "speed",
        "type": "number",
        "def": "1",
        "desc": "Animation speed multiplier."
      },
      {
        "prop": "density",
        "type": "number",
        "def": "42",
        "desc": "Grid density: LED columns across the width."
      }
    ],
    defaults:     {
      "color": "#e02fd4",
      "background": "#0f1013",
      "speed": 1,
      "density": 42
    },
    controls:     [
      {
        "key": "color",
        "label": "Color",
        "kind": "color"
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "color"
      },
      {
        "key": "speed",
        "label": "Speed",
        "kind": "range",
        "min": 0.1,
        "max": 2.5,
        "step": 0.1
      },
      {
        "key": "density",
        "label": "Density",
        "kind": "range",
        "min": 24,
        "max": 64,
        "step": 2
      }
    ],
    render: (v) => React.createElement(PixelPulse, toProps<PixelPulseProps>(v)),
  },
];
