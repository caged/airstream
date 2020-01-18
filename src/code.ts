import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';

figma.showUI(__html__);

enum AllowedTypes {
  ELLIPSE,
  RECTANGLE,
  POLYGON
}

// const scale = scaleLinear().domain([0, 0.4, 0.8]);

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
      fills.push({
        name: shape.name,
        color: fill.color,
      });
    }
  }

  return fills;
};

figma.ui.onmessage = ({ type, count }) => {
  if (type === 'generate') {
    const stepCount = count - 1;
    const size = 50;
    const nodes = [];
    const steps = generateColorSteps();
    const colors = steps.map((f) => f.color);
    const domain = steps.map((_, i) => (i === 0 ? 0 : stepCount / i)).sort();

    const scale = scaleLinear()
      .domain(domain)
      .range(colors);

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

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
