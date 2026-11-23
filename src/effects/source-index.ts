import engineSource from "./engine.tsx?raw";
import glowThreadsSource from "./fx/glow-threads.tsx?raw";
import inkHalftoneSource from "./fx/ink-halftone.tsx?raw";
import cometCascadeSource from "./fx/comet-cascade.tsx?raw";
import velvetSweepSource from "./fx/velvet-sweep.tsx?raw";
import signalGridSource from "./fx/signal-grid.tsx?raw";
import nimbusTwistSource from "./fx/nimbus-twist.tsx?raw";
import dotBloomSource from "./fx/dot-bloom.tsx?raw";
import silkFlowSource from "./fx/silk-flow.tsx?raw";
import stormBoltSource from "./fx/storm-bolt.tsx?raw";
import glyphTideSource from "./fx/glyph-tide.tsx?raw";
import auroraSpireSource from "./fx/aurora-spire.tsx?raw";
import photonRushSource from "./fx/photon-rush.tsx?raw";
import mistOrbSource from "./fx/mist-orb.tsx?raw";
import ditherDriftSource from "./fx/dither-drift.tsx?raw";
import laserFieldSource from "./fx/laser-field.tsx?raw";
import mercuryVeinsSource from "./fx/mercury-veins.tsx?raw";
import horizonGridSource from "./fx/horizon-grid.tsx?raw";
import echoRingsSource from "./fx/echo-rings.tsx?raw";
import satinStreaksSource from "./fx/satin-streaks.tsx?raw";
import starSurgeSource from "./fx/star-surge.tsx?raw";
import vaporRibbonsSource from "./fx/vapor-ribbons.tsx?raw";
import crestColumnsSource from "./fx/crest-columns.tsx?raw";
import lightStrandsSource from "./fx/light-strands.tsx?raw";
import opalFilmSource from "./fx/opal-film.tsx?raw";
import pulseBeamsSource from "./fx/pulse-beams.tsx?raw";
import marbleFluxSource from "./fx/marble-flux.tsx?raw";
import shutterFadeSource from "./fx/shutter-fade.tsx?raw";
import orbitTrailsSource from "./fx/orbit-trails.tsx?raw";
import gumballDropSource from "./fx/gumball-drop.tsx?raw";
import veilRaysSource from "./fx/veil-rays.tsx?raw";
import neonWashSource from "./fx/neon-wash.tsx?raw";
import duskFilamentsSource from "./fx/dusk-filaments.tsx?raw";
import moltenPanesSource from "./fx/molten-panes.tsx?raw";
import helixHazeSource from "./fx/helix-haze.tsx?raw";
import dawnCurrentSource from "./fx/dawn-current.tsx?raw";
import pixelPulseSource from "./fx/pixel-pulse.tsx?raw";

/** Raw text of every generated effect module, plus the shared engine. */
export const ENGINE_SOURCE: string = engineSource;

export const EFFECT_SOURCES: Record<string, string> = {
  "glow-threads": glowThreadsSource,
  "ink-halftone": inkHalftoneSource,
  "comet-cascade": cometCascadeSource,
  "velvet-sweep": velvetSweepSource,
  "signal-grid": signalGridSource,
  "nimbus-twist": nimbusTwistSource,
  "dot-bloom": dotBloomSource,
  "silk-flow": silkFlowSource,
  "storm-bolt": stormBoltSource,
  "glyph-tide": glyphTideSource,
  "aurora-spire": auroraSpireSource,
  "photon-rush": photonRushSource,
  "mist-orb": mistOrbSource,
  "dither-drift": ditherDriftSource,
  "laser-field": laserFieldSource,
  "mercury-veins": mercuryVeinsSource,
  "horizon-grid": horizonGridSource,
  "echo-rings": echoRingsSource,
  "satin-streaks": satinStreaksSource,
  "star-surge": starSurgeSource,
  "vapor-ribbons": vaporRibbonsSource,
  "crest-columns": crestColumnsSource,
  "light-strands": lightStrandsSource,
  "opal-film": opalFilmSource,
  "pulse-beams": pulseBeamsSource,
  "marble-flux": marbleFluxSource,
  "shutter-fade": shutterFadeSource,
  "orbit-trails": orbitTrailsSource,
  "gumball-drop": gumballDropSource,
  "veil-rays": veilRaysSource,
  "neon-wash": neonWashSource,
  "dusk-filaments": duskFilamentsSource,
  "molten-panes": moltenPanesSource,
  "helix-haze": helixHazeSource,
  "dawn-current": dawnCurrentSource,
  "pixel-pulse": pixelPulseSource,
};
