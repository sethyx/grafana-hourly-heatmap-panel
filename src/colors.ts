import * as d3 from 'd3';
import { ThresholdsConfig, ThresholdsMode } from '@grafana/data';

type Interpolator = (t: number) => string;

interface ColorScaleLookup {
  [name: string]: Interpolator;
}

const interpolators: ColorScaleLookup = {
  // Diverging
  interpolateSpectral: d3.interpolateSpectral,
  interpolateRdYlGn: d3.interpolateRdYlGn,

  // Single hue
  interpolateBlues: d3.interpolateBlues,
  interpolateGreens: d3.interpolateGreens,
  interpolateGreys: d3.interpolateGreys,
  interpolateOranges: d3.interpolateOranges,
  interpolatePurples: d3.interpolatePurples,
  interpolateReds: d3.interpolateReds,

  // Multi-hue
  interpolateBuGn: d3.interpolateBuGn,
  interpolateBuPu: d3.interpolateBuPu,
  interpolateGnBu: d3.interpolateGnBu,
  interpolateOrRd: d3.interpolateOrRd,
  interpolatePuBuGn: d3.interpolatePuBuGn,
  interpolatePuBu: d3.interpolatePuBu,
  interpolatePuRd: d3.interpolatePuRd,
  interpolateRdPu: d3.interpolateRdPu,
  interpolateYlGnBu: d3.interpolateYlGnBu,
  interpolateYlGn: d3.interpolateYlGn,
  interpolateYlOrBr: d3.interpolateYlOrBr,
  interpolateYlOrRd: d3.interpolateYlOrRd,
};

export const makeSpectrumColorScale = (scheme: string, min: number, max: number): d3.ScaleSequential<string> => {
  const interpolator = interpolators[scheme];
  return d3.scaleSequential(interpolator).domain([max, min]);
};

interface InterpolatorLookup {
  [name: string]: d3.InterpolatorFactory<string, string>;
}

const interpolationMap: InterpolatorLookup = {
  rgb: d3.interpolateRgb,
  hsl: d3.interpolateHsl,
  hcl: d3.interpolateHcl,
  lab: d3.interpolateLab,
  cubehelix: d3.interpolateCubehelix,
};

export const makeCustomColorScale = (colorSpace: string, min: number, max: number, thresholds: ThresholdsConfig) => {
  const interpolator = interpolationMap[colorSpace];
  const colorRange = thresholds.steps.map(({ color }) => color);

  if (thresholds.mode === ThresholdsMode.Absolute) {
    return d3
      .scaleLinear<string>()
      .domain(thresholds.steps.map(({ value }) => (value >= 0 ? value : 0.0)))
      .range(colorRange)
      .interpolate(interpolator);
  }

  const scale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([min, max]);

  return d3
    .scaleLinear<string>()
    .domain(thresholds.steps.map(({ value }) => (value >= 0 ? scale(value) : 0.0)))
    .range(colorRange)
    .interpolate(interpolator);
};
