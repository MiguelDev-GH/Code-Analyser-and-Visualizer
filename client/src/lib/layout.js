import dagre from 'dagre';
import { Position } from 'reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const NODE_WIDTH_DESC = 240;
const NODE_HEIGHT_DESC = 120;

export function getLayoutedElements(nodes, edges, direction = 'LR', isDescVisible = false) {
  const w = isDescVisible ? NODE_WIDTH_DESC : NODE_WIDTH;
  const h = isDescVisible ? NODE_HEIGHT_DESC : NODE_HEIGHT;

  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: w, height: h }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const positionMap = {
    LR: { targetPosition: Position.Left,   sourcePosition: Position.Right  },
    RL: { targetPosition: Position.Right,  sourcePosition: Position.Left   },
    TB: { targetPosition: Position.Top,    sourcePosition: Position.Bottom },
    BT: { targetPosition: Position.Bottom, sourcePosition: Position.Top    },
  };

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      ...(positionMap[direction] || {}),
      position: { x: x - w / 2, y: y - h / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}
