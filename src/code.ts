import { color, rgb } from "d3-color";
import { scaleLinear } from "d3-scale";
figma.showUI(__html__);

enum AllowedTypes {
  ELLIPSE,
  RECTANGLE,
  POLYGON
}

const scale = scaleLinear().domain([0, 0.4, 0.8]);

const getFirstFill = shape => {
  const solids = (shape as GeometryMixin).fills as ReadonlyArray<Paint>;
  return solids.find(s => s.type === "SOLID") as SolidPaint;
};

const isAllowedShape = (shape): boolean => {
  return (AllowedTypes[shape.type] as unknown) <= AllowedTypes.POLYGON;
};

const generateColorSteps = () => {
  const { selection } = figma.currentPage;
  const fills = [];
  for (let shape of selection) {
    if (isAllowedShape(shape)) {
      const fill = getFirstFill(shape);
      fills.push({
        name: shape.name,
        color: fill.color
      });
    }
  }

  return fills;
};

figma.ui.onmessage = msg => {
  const size = 50;
  if (msg.type === "generate-steps") {
    const nodes = [];
    const fills = generateColorSteps();
    scale.range(fills.map(f => f.color));

    let j = 0;
    for (let i = 0; i <= 0.8; i += 0.1) {
      const color = scale(i);
      const rect = figma.createRectangle();
      rect.resize(size, size);
      rect.x = j * size + (j * size) / 3;
      rect.fills = [{ type: "SOLID", color }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
      j += 1;
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
