import * as s from "react/jsx-runtime";
import {
  S as P,
  G,
  L as T,
  a as H,
  I as O,
  D as W,
  H as V,
  V as E,
} from "./canvas-effects.js";
import {
  P as L,
  E as M,
  S as I,
  C as q,
  M as _,
  a as K,
  D as U,
  b as Q,
  c as J,
  d as X,
  N as Y,
  L as Z,
  O as ee,
  e as se,
  V as oe,
  f as re,
  g as ae,
  H as ne,
  A as te,
  G as ce,
  h as ie,
  i as de,
  j as le,
  k as ue,
  l as ge,
  m as me,
  n as be,
  o as fe,
} from "./webgl-effects.js";
const l = "#ceff00",
  u = {
    prop: "colors",
    type: "string[]",
    def: "['#767676', '#f2f4f8', '#a6abb4']",
    desc: "Three-stop palette. Each entry accepts a hex or a var(--token) reference.",
  },
  c = {
    prop: "color",
    type: "string",
    def: "var(--color-accent)",
    desc: "Effect color. Accepts a hex or a var(--token) reference.",
  },
  r = {
    prop: "background",
    type: "string",
    def: "var(--color-fx-canvas)",
    desc: "Canvas fill behind the effect.",
  },
  a = {
    prop: "speed",
    type: "number",
    def: "1",
    desc: "Animation speed multiplier.",
  },
  n = {
    key: "speed",
    label: "Speed",
    kind: "range",
    min: 0.1,
    max: 2.5,
    step: 0.1,
  },
  t = { key: "background", label: "Background", kind: "color" },
  i = { key: "color", label: "Color", kind: "color" },
  g = [
    { key: "c0", label: "Color 1", kind: "color" },
    { key: "c1", label: "Color 2", kind: "color" },
    { key: "c2", label: "Color 3", kind: "color" },
  ],
  xe = [
    {
      id: "silk-flow",
      name: "Silk Flow",
      tech: "webgl",
      desc: "Full-bleed silk folds drifting sideways — a WebGL field made to sit behind hero content.",
      props: [u, r, a],
      defaults: {
        c0: "#767676",
        c1: "#f2f4f8",
        c2: "#a6abb4",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(P, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (e) => `import { SilkFlow } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <SilkFlow colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "glyph-tide",
      name: "Glyph Tide",
      tech: "canvas-2d",
      desc: "A terminal glyph ramp breathing as a wave field. Pure text, pure canvas.",
      props: [
        c,
        r,
        a,
        {
          prop: "characters",
          type: "string",
          def: "' .:-+*=%@#'",
          desc: "Glyph density ramp, sparse to dense.",
        },
      ],
      defaults: {
        color: "#b8bdc6",
        background: "#0f1013",
        speed: 1,
        characters: " .:-+*=%@#",
      },
      controls: [
        i,
        t,
        n,
        { key: "characters", label: "Characters", kind: "text" },
      ],
      render: (e) =>
        s.jsx(G, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          characters: String(e.characters),
        }),
      usage: (
        e,
      ) => `import { GlyphTide } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <GlyphTide color="${e.color}" background="${e.background}" speed={${e.speed}} characters="${e.characters}" />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "light-strands",
      name: "Light Strands",
      tech: "canvas-2d",
      desc: "Dozens of additive light strands weaving a silky gradient ribbon under film grain.",
      props: [u, r, a],
      defaults: {
        c0: "#767676",
        c1: "#f2f4f8",
        c2: "#a6abb4",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(T, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { LightStrands } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <LightStrands colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "signal-grid",
      name: "Signal Grid",
      tech: "canvas-2d",
      desc: "A fine grid of squares that quietly twinkle, dense at one edge and fading to empty.",
      props: [
        c,
        r,
        a,
        {
          prop: "anchor",
          type: "'left' | 'right'",
          def: "'left'",
          desc: "Edge the dense squares anchor to; the grid fades toward the other side.",
        },
      ],
      defaults: {
        color: "#a9aeb6",
        background: "#0f1013",
        speed: 1,
        anchor: "left",
      },
      controls: [
        i,
        t,
        n,
        {
          key: "anchor",
          label: "Anchor",
          kind: "segment",
          options: ["left", "right"],
        },
      ],
      render: (e) =>
        s.jsx(H, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          anchor: e.anchor === "right" ? "right" : "left",
        }),
      usage: (
        e,
      ) => `import { SignalGrid } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <SignalGrid color="${e.color}" background="${e.background}" speed={${e.speed}} anchor="${e.anchor}" />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "ink-halftone",
      name: "Ink Halftone",
      tech: "canvas-2d",
      desc: "Print-style halftone dots, their radius modulated by a travelling wave.",
      props: [c, r, a],
      defaults: { color: "#cfd3da", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(O, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { InkHalftone } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <InkHalftone color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "dither-drift",
      name: "Dither Drift",
      tech: "canvas-2d",
      desc: "Smooth wave bands quantized through a Bayer matrix into retro ordered dither.",
      props: [c, r, a],
      defaults: { color: "#878d96", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(W, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { DitherDrift } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <DitherDrift color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "horizon-grid",
      name: "Horizon Grid",
      tech: "canvas-2d",
      desc: "An endless floor grid scrolling toward the viewer, glowing at the horizon.",
      props: [c, r, a],
      defaults: { color: "#c0c5cd", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(V, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { HorizonGrid } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <HorizonGrid color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "veil-rays",
      name: "Veil Rays",
      tech: "webgl",
      desc: "Soft volumetric light falling from above — organic beams, a breathing cone, and film grain.",
      props: [c, r, a],
      defaults: { color: "#dde3ec", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(E, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (e) => `import { VeilRays } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <VeilRays color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "pulse-beams",
      name: "Pulse Beams",
      tech: "webgl",
      desc: "A wall of vertical light columns, each flickering on its own tempo under soft bloom.",
      props: [
        c,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "16",
          desc: "Number of beams across the width.",
        },
      ],
      defaults: {
        color: "#d6dbe4",
        background: "#0f1013",
        speed: 1,
        count: 16,
      },
      controls: [
        i,
        t,
        n,
        {
          key: "count",
          label: "Beams",
          kind: "range",
          min: 6,
          max: 28,
          step: 1,
        },
      ],
      render: (e) =>
        s.jsx(L, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { PulseBeams } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <PulseBeams color="${e.color}" background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "echo-rings",
      name: "Echo Rings",
      tech: "webgl",
      desc: "Soft color loops arcing up from below the frame, hue drifting from core to rim as the bands ripple outward.",
      props: [u, r, a],
      defaults: {
        c0: "#4130d6",
        c1: "#8d2fd0",
        c2: "#d62a55",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(M, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { EchoRings } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <EchoRings colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "star-surge",
      name: "Star Surge",
      tech: "canvas-2d",
      desc: "A starfield rushing out from center: twinkling points in the core, motion-blur streaks at the rim.",
      props: [
        c,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "260",
          desc: "Number of stars in the field.",
        },
      ],
      defaults: {
        color: "#c9cfe6",
        background: "#0f1013",
        speed: 1,
        count: 260,
      },
      controls: [
        i,
        t,
        n,
        {
          key: "count",
          label: "Stars",
          kind: "range",
          min: 100,
          max: 500,
          step: 20,
        },
      ],
      render: (e) =>
        s.jsx(I, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { StarSurge } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <StarSurge color="${e.color}" background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "comet-cascade",
      name: "Comet Cascade",
      tech: "canvas-2d",
      desc: "Comet trails pouring down the center, banking outward near the floor like a fountain hitting glass.",
      props: [
        u,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "36",
          desc: "Number of comet trails in the cascade.",
        },
      ],
      defaults: {
        c0: "#5b4bd8",
        c1: "#9b3fd4",
        c2: "#e04fae",
        background: "#0f1013",
        speed: 1,
        count: 36,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "count",
          label: "Trails",
          kind: "range",
          min: 18,
          max: 63,
          step: 9,
        },
      ],
      render: (e) =>
        s.jsx(q, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { CometCascade } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <CometCascade colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "mist-orb",
      name: "Mist Orb",
      tech: "webgl",
      desc: "A sphere of slow-turning fog: wisps wrap the globe in soft layers and spill faintly past the limb.",
      props: [c, r, a],
      defaults: { color: "#c936ae", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(_, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (e) => `import { MistOrb } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <MistOrb color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "crest-columns",
      name: "Crest Columns",
      tech: "canvas-2d",
      desc: "Vertical gradient bars, each with a glowing crest line rolling on a V-shaped wave across the columns.",
      props: [
        c,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "16",
          desc: "Number of columns across the width.",
        },
      ],
      defaults: {
        color: "#dde1ea",
        background: "#0f1013",
        speed: 1,
        count: 16,
      },
      controls: [
        i,
        t,
        n,
        {
          key: "count",
          label: "Columns",
          kind: "range",
          min: 8,
          max: 28,
          step: 1,
        },
      ],
      render: (e) =>
        s.jsx(K, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { CrestColumns } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <CrestColumns color="${e.color}" background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "dot-bloom",
      name: "Dot Bloom",
      tech: "canvas-2d",
      desc: "A halftone dot matrix under drifting weather: cloud patches of light form, morph, and slide across the grid.",
      props: [
        c,
        r,
        a,
        {
          prop: "density",
          type: "number",
          def: "40",
          desc: "Grid density: dot columns across the width.",
        },
      ],
      defaults: {
        color: "#d4d8e0",
        background: "#0f1013",
        speed: 1,
        density: 40,
      },
      controls: [
        i,
        t,
        n,
        {
          key: "density",
          label: "Density",
          kind: "range",
          min: 24,
          max: 64,
          step: 2,
        },
      ],
      render: (e) =>
        s.jsx(U, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          density: Number(e.density),
        }),
      usage: (e) => `import { DotBloom } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <DotBloom color="${e.color}" background="${e.background}" speed={${e.speed}} density={${e.density}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "photon-rush",
      name: "Photon Rush",
      tech: "canvas-2d",
      desc: "A hyperspace jump: bold light streaks racing radially out of a dark core, tinted from the palette.",
      props: [
        u,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "90",
          desc: "Number of streaks in the jump.",
        },
      ],
      defaults: {
        c0: "#8f7bff",
        c1: "#f2f4f8",
        c2: "#b48cf2",
        background: "#0f1013",
        speed: 1,
        count: 90,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "count",
          label: "Streaks",
          kind: "range",
          min: 40,
          max: 160,
          step: 10,
        },
      ],
      render: (e) =>
        s.jsx(Q, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { PhotonRush } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <PhotonRush colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "molten-panes",
      name: "Molten Panes",
      tech: "webgl",
      desc: "Vertical glass panes filled with slow-rising liquid chrome, creased into glossy folds by the palette.",
      props: [
        u,
        r,
        a,
        {
          prop: "panes",
          type: "number",
          def: "6",
          desc: "Number of panes across the width.",
        },
      ],
      defaults: {
        c0: "#4c1d95",
        c1: "#a855f7",
        c2: "#e879f9",
        background: "#0f1013",
        speed: 1,
        panes: 6,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "panes",
          label: "Panes",
          kind: "range",
          min: 3,
          max: 10,
          step: 1,
        },
      ],
      render: (e) =>
        s.jsx(J, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          panes: Number(e.panes),
        }),
      usage: (
        e,
      ) => `import { MoltenPanes } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <MoltenPanes colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} panes={${e.panes}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "satin-streaks",
      name: "Satin Streaks",
      tech: "webgl",
      desc: "Long diagonal light trails, like satin caught in a slow pan: broad soft bands under a fine sparkle of thin lines.",
      props: [u, r, a],
      defaults: {
        c0: "#aeb6c4",
        c1: "#f4f2ee",
        c2: "#d9c1a0",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(X, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { SatinStreaks } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <SatinStreaks colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "neon-wash",
      name: "Neon Wash",
      tech: "webgl",
      desc: "A neon tube igniting like a real one: sputtering flashes, the wash filling the wall top to bottom, then locking on.",
      props: [c, r, a],
      defaults: { color: "#a855f7", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(Y, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (e) => `import { NeonWash } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <NeonWash color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "laser-field",
      name: "Laser Field",
      tech: "canvas-2d",
      desc: "A glowing laser baseline with thin beams breathing out of it and sparks drifting up through the dark.",
      props: [
        c,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "70",
          desc: "Number of beams; sparks scale along.",
        },
      ],
      defaults: {
        color: "#d945c8",
        background: "#0f1013",
        speed: 1,
        count: 70,
      },
      controls: [
        i,
        t,
        n,
        {
          key: "count",
          label: "Beams",
          kind: "range",
          min: 30,
          max: 120,
          step: 5,
        },
      ],
      render: (e) =>
        s.jsx(Z, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { LaserField } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <LaserField color="${e.color}" background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "orbit-trails",
      name: "Orbit Trails",
      tech: "canvas-2d",
      desc: "Thin arcs of light circling a shared center, like star trails in a long exposure: inner orbits whip, outer ones glide.",
      props: [
        u,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "80",
          desc: "Number of orbit trails.",
        },
      ],
      defaults: {
        c0: "#8f7bff",
        c1: "#5b6cff",
        c2: "#c96af2",
        background: "#0f1013",
        speed: 1,
        count: 80,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "count",
          label: "Trails",
          kind: "range",
          min: 40,
          max: 140,
          step: 10,
        },
      ],
      render: (e) =>
        s.jsx(ee, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { OrbitTrails } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <OrbitTrails colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "marble-flux",
      name: "Marble Flux",
      tech: "webgl",
      desc: "Glossy fluid folds kneading themselves in slow motion, like poured gloss under studio light.",
      props: [c, r, a],
      defaults: { color: "#cc16c2", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(se, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { MarbleFlux } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <MarbleFlux color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "velvet-sweep",
      name: "Velvet Sweep",
      tech: "webgl",
      desc: "One curved ribbon of glowing cloth sweeping the frame, silk striations sliding along it, the rest left dark.",
      props: [c, r, a],
      defaults: { color: "#3230e0", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(oe, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { VelvetSweep } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <VelvetSweep color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "pixel-pulse",
      name: "Pixel Pulse",
      tech: "canvas-2d",
      desc: "An LED wall of rounded square cells pulsing as clean concentric rings radiating from the center.",
      props: [
        c,
        r,
        a,
        {
          prop: "density",
          type: "number",
          def: "42",
          desc: "Grid density: LED columns across the width.",
        },
      ],
      defaults: {
        color: "#e02fd4",
        background: "#0f1013",
        speed: 1,
        density: 42,
      },
      controls: [
        i,
        t,
        n,
        {
          key: "density",
          label: "Density",
          kind: "range",
          min: 24,
          max: 64,
          step: 2,
        },
      ],
      render: (e) =>
        s.jsx(re, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
          density: Number(e.density),
        }),
      usage: (
        e,
      ) => `import { PixelPulse } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <PixelPulse color="${e.color}" background="${e.background}" speed={${e.speed}} density={${e.density}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "dusk-filaments",
      name: "Dusk Filaments",
      tech: "webgl",
      desc: "Stacked neon filaments riding one shared S-curve, a warm sweep gliding along them with a chromatic fringe.",
      props: [u, r, a],
      defaults: {
        c0: "#4638d8",
        c1: "#f04fd0",
        c2: "#f2ecff",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(ae, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { DuskFilaments } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <DuskFilaments colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "helix-haze",
      name: "Helix Haze",
      tech: "webgl",
      desc: "A rope of fine fibers twisted across the frame, deliberately dim: a slow-turning texture, not a beacon.",
      props: [c, r, a],
      defaults: { color: "#c084fc", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(ne, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { HelixHaze } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <HelixHaze color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* section content */}</div>
</section>`,
    },
    {
      id: "aurora-spire",
      name: "Aurora Spire",
      tech: "webgl",
      desc: "A slow column of light climbing through the frame, silky veils rising and wrapping inside it.",
      props: [u, r, a],
      defaults: {
        c0: "#6d4df2",
        c1: "#f27dd7",
        c2: "#f4ecff",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(te, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { AuroraSpire } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <AuroraSpire colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "glow-threads",
      name: "Glow Threads",
      tech: "webgl",
      desc: "Bundles of luminous threads drifting across the frame, each fan bending with distance and breathing as it goes.",
      props: [
        u,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "9",
          desc: "Threads per bundle (3 to 14).",
        },
      ],
      defaults: {
        c0: "#e86bd8",
        c1: "#f5f0fa",
        c2: "#8b5bd6",
        background: "#0f1013",
        speed: 1,
        count: 9,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "count",
          label: "Threads",
          kind: "range",
          min: 3,
          max: 14,
          step: 1,
        },
      ],
      render: (e) =>
        s.jsx(ce, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { GlowThreads } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <GlowThreads colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "vapor-ribbons",
      name: "Vapor Ribbons",
      tech: "webgl",
      desc: "A few wide, misty bands of color snaking across the frame, one palette stop per ribbon, no hard edges anywhere.",
      props: [u, r, a],
      defaults: {
        c0: "#a86df2",
        c1: "#d66de0",
        c2: "#6d5df2",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(ie, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { VaporRibbons } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <VaporRibbons colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "dawn-current",
      name: "Dawn Current",
      tech: "webgl",
      desc: "One soft current of light flowing across mid-frame, hues sliding through it, no hard edge in the whole frame.",
      props: [u, r, a],
      defaults: {
        c0: "#5b8af2",
        c1: "#a86df2",
        c2: "#f25b9e",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(de, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { DawnCurrent } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <DawnCurrent colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "shutter-fade",
      name: "Shutter Fade",
      tech: "webgl",
      desc: "A three-stop gradient sliced into tilted blinds, dark until a cursor-following spotlight lifts the slats it crosses.",
      props: [
        u,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "14",
          desc: "Number of blinds across the frame.",
        },
      ],
      defaults: {
        c0: "#f28ae0",
        c1: "#8a5cf2",
        c2: "#4632d8",
        background: "#0f1013",
        speed: 1,
        count: 14,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "count",
          label: "Blinds",
          kind: "range",
          min: 6,
          max: 24,
          step: 1,
        },
      ],
      render: (e) =>
        s.jsx(le, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { ShutterFade } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <ShutterFade colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "storm-bolt",
      name: "Storm Bolt",
      tech: "webgl",
      desc: "One bolt of lightning crackling down the frame: it re-strikes on a new path every few seconds and strobes as it holds.",
      props: [c, r, a],
      defaults: { color: "#b48cf2", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(ue, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { StormBolt } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <StormBolt color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "opal-film",
      name: "Opal Film",
      tech: "webgl",
      desc: "A bright sheet of thin-film iridescence, rainbow fringes tracing a kneading field: the one daylight surface in the set.",
      props: [c, r, a],
      defaults: { color: "#8099cc", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(ge, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (e) => `import { OpalFilm } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <OpalFilm color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "gumball-drop",
      name: "Gumball Drop",
      tech: "canvas-2d",
      desc: "Glossy balls tumbling into a pit under real 2D physics, and the cursor shoulders through the pile.",
      props: [
        u,
        r,
        a,
        {
          prop: "count",
          type: "number",
          def: "26",
          desc: "Number of balls in the pit.",
        },
      ],
      defaults: {
        c0: "#4c3ff2",
        c1: "#f0f0f4",
        c2: "#5c5a66",
        background: "#0f1013",
        speed: 1,
        count: 26,
      },
      controls: [
        ...g,
        t,
        n,
        {
          key: "count",
          label: "Balls",
          kind: "range",
          min: 10,
          max: 50,
          step: 2,
        },
      ],
      render: (e) =>
        s.jsx(me, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
          count: Number(e.count),
        }),
      usage: (
        e,
      ) => `import { GumballDrop } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <GumballDrop colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} count={${e.count}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "nimbus-twist",
      name: "Nimbus Twist",
      tech: "webgl",
      desc: "A luminous halo breathing at center frame; bring the cursor near and it squirms into tendrils and spins faster.",
      props: [u, r, a],
      defaults: {
        c0: "#9c43fe",
        c1: "#4cc2e9",
        c2: "#141980",
        background: "#0f1013",
        speed: 1,
      },
      controls: [...g, t, n],
      render: (e) =>
        s.jsx(be, {
          colors: [String(e.c0), String(e.c1), String(e.c2)],
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { NimbusTwist } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <NimbusTwist colors={['${e.c0}', '${e.c1}', '${e.c2}']} background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
    {
      id: "mercury-veins",
      name: "Mercury Veins",
      tech: "webgl",
      desc: "A churning pool of liquid metal, white-hot veins snaking through dark chrome, and the cursor stirs it.",
      props: [c, r, a],
      defaults: { color: "#e6e6ec", background: "#0f1013", speed: 1 },
      controls: [i, t, n],
      render: (e) =>
        s.jsx(fe, {
          color: String(e.color),
          background: String(e.background),
          speed: Number(e.speed),
        }),
      usage: (
        e,
      ) => `import { MercuryVeins } from '~/components/backgrounds/effects'

<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <MercuryVeins color="${e.color}" background="${e.background}" speed={${e.speed}} />
  </div>
  <div className="relative">{/* hero content */}</div>
</section>`,
    },
  ],
  ve = [
    "glow-threads",
    "ink-halftone",
    "comet-cascade",
    "velvet-sweep",
    "signal-grid",
    "nimbus-twist",
    "dot-bloom",
    "silk-flow",
    "storm-bolt",
    "glyph-tide",
    "aurora-spire",
    "photon-rush",
    "mist-orb",
    "dither-drift",
    "laser-field",
    "mercury-veins",
    "horizon-grid",
    "echo-rings",
    "satin-streaks",
    "star-surge",
    "vapor-ribbons",
    "crest-columns",
    "light-strands",
    "opal-film",
    "pulse-beams",
    "marble-flux",
    "shutter-fade",
    "orbit-trails",
    "gumball-drop",
    "veil-rays",
    "neon-wash",
    "dusk-filaments",
    "molten-panes",
    "helix-haze",
    "dawn-current",
    "pixel-pulse",
  ],
  k = ve.map((e, p) => {
    const x = xe.find((v) => v.id === e);
    if (!x) throw new Error(`Missing background effect: ${e}`);
    return { ...x, index: `/${String(p + 1).padStart(2, "0")}` };
  });
export { k as BACKGROUNDS, l as ACCENT };
