import { scaleLinear, scaleSequential } from 'd3-scale';
import { rgb } from 'd3-color';
import * as scales from 'd3-scale-chromatic';

figma.showUI(__html__, { width: 400, height: 300 });

// TODO: https://github.com/typescript-eslint/typescript-eslint/issues/1197
enum AllowedTypes {
  ELLIPSE, // eslint-disable-line no-unused-vars
  RECTANGLE, // eslint-disable-line no-unused-vars
  POLYGON // eslint-disable-line no-unused-vars
}

const getFirstFill = (shape) => {
  const solids = (shape as GeometryMixin).fills as ReadonlyArray<Paint>;
  return solids.find((s) => s.type === 'SOLID') as SolidPaint;
};

const isAllowedShape = (shape): boolean => (
  (AllowedTypes[shape.type] as unknown) <= AllowedTypes.POLYGON
);

const clone = (val) => JSON.parse(JSON.stringify(val));

const generateColorSteps = () => {
  const { selection } = figma.currentPage;
  const fills = [];
  for (const shape of selection) {
    if (isAllowedShape(shape)) {
      const fill = getFirstFill(shape);
      fills.push(fill.color);
    }
  }

  return fills;
};

const createRect = (width, height, fill) => {
  const rect = figma.createRectangle();
  const fills = clone(rect.fills);

  rect.resize(width, height);
  fills[0].color = fill;
  rect.fills = fills;

  return rect;
};

const figmaColorInterpolator = (d3Interpolator) => {
  const interpolator = scales[d3Interpolator];
  return (t) => {
    const c = interpolator(t);
    const { r, g, b } = rgb(c);
    return { r: r / 255, g: g / 255, b: b / 255 };
  };
};

const hexFromFigmaColor = ({ r, g, b }) => rgb(r * 255, g * 255, b * 255).hex();

figma.ui.onmessage = ({ type, ...props }) => {
  const size = 50;

  if (type === 'generate-fill-blend') {
    const { count } = props;
    const stepCount = count - 1;
    const nodes = [];

    const colors = generateColorSteps();
    const domain = colors.map((_, i) => (i === 0 ? 0 : stepCount / i)).sort();

    const scale = scaleLinear()
      .domain(domain)
      .range(colors) as any;

    for (let i = 0; i <= stepCount; i += 1) {
      const color = scale(i);
      const hex = hexFromFigmaColor(color);

      const rect = createRect(size, size, color);

      rect.x = i * size + (i * size) / 3;
      rect.cornerRadius = 3;
      rect.name = hex;

      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    const group = figma.group(figma.currentPage.selection, figma.currentPage);
    group.name = 'Colors';
  }

  if (type === 'generate-palette-steps') {
    const nodes = [];
    const { interpolator, steps } = props;
    const scale = scaleSequential(figmaColorInterpolator(interpolator)).domain([0, steps]);

    for (let i = 0; i < steps; i++) {
      const color = scale(i);
      const rect = createRect(size, size, color);
      rect.x = i * size + (i * size) / 3;
      rect.cornerRadius = 3;
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    const group = figma.group(figma.currentPage.selection, figma.currentPage);
    group.name = `${steps} ${interpolator} colors`;
  }


  figma.closePlugin();
};
