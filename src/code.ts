import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';

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

figma.ui.onmessage = ({ type, count }) => {
  if (type === 'generate') {
    const stepCount = count - 1;
    const size = 50;
    const nodes = [];

    const colors = generateColorSteps();
    const domain = colors.map((_, i) => (i === 0 ? 0 : stepCount / i)).sort();

    const scale = scaleLinear()
      .domain(domain)
      .range(colors) as any;

    for (let i = 0; i <= stepCount; i += 1) {
      const color = scale(i);
      const { r, g, b } = color;
      const hex = rgb(r * 255, g * 255, b * 255).hex();

      const rect = figma.createRectangle();
      const fills = clone(rect.fills);

      fills[0].color = color;
      rect.fills = fills;

      rect.resize(size, size);
      rect.x = i * size + (i * size) / 3;
      rect.cornerRadius = 3;
      rect.name = hex;

      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    const group = figma.group(figma.currentPage.selection, figma.currentPage);
    group.name = 'Colors';
    figma.viewport.scrollAndZoomIntoView(nodes);
  }


  figma.closePlugin();
};
