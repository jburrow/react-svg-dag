import * as React from "react";
import { render } from "react-dom";
import * as svgPanZoom from "svg-pan-zoom";

type IdType = number;

interface DAGNode {
  title?: string;
  id: IdType;
  parent?: IdType;
}

export const config = {
  width: 100,
  height: 50,
  horizontalGap: 25,
  verticalGap: 50,
};

export const xxx = (dagNodes) => {
  const r = calculateDepths(dagNodes);
  const nodes: Node[] = [];
  const idToNode: Record<IdType, Node> = {};

  for (const [xdepth, dagnodes] of Object.entries(r.depthToNodes)) {
    const depth = parseInt(xdepth, 10);

    for (const [idx, dagnode] of dagnodes.entries()) {
      const n: Node = {
        depth,
        height: config.height,
        width: config.width,
        x: (config.width + config.horizontalGap) * idx,
        y: (config.height + config.verticalGap) * depth,
        node: dagnode,
        index: dagnode.parent !== null ? r.parentToIds[dagnode.parent].indexOf(dagnode.id) : 0,
      };

      nodes.push(n);
      idToNode[dagnode.id] = n;
    }
  }

  const edges = [];
  for (const edge of r.edges) {
    edges.push({ from: idToNode[edge[0].id], to: idToNode[edge[1].id] });
  }

  return { nodes, edges };
};

export const calculateDepths = (nodes: DAGNode[]) => {
  const idToNode: Record<IdType, DAGNode> = {};
  const idToParent: Record<IdType, IdType> = {};
  const idToDepth: Record<IdType, IdType> = {};
  const idToDepthIndex: Record<IdType, number> = {};
  const depthToNodes: Record<number, DAGNode[]> = {};
  const parentToIds: Record<IdType, IdType[]> = {};
  const edges: [DAGNode, DAGNode][] = [];

  for (const node of nodes) {
    idToNode[node.id] = node;
    idToParent[node.id] = node.parent;
    if (!parentToIds[node.parent]) {
      parentToIds[node.parent] = [];
    }

    parentToIds[node.parent].push(node.id);
  }

  for (const node of nodes) {
    let depth = 0;
    let tmp = node;
    while (tmp.parent !== null && tmp.parent !== undefined) {
      tmp = idToNode[tmp.parent];
      depth += 1;
    }
    if (depthToNodes[depth] === undefined) {
      depthToNodes[depth] = [];
    }

    idToDepth[node.id] = depth;
    depthToNodes[depth].push(node);
    idToDepthIndex[node.id] = depthToNodes[depth].length;

    if (node.parent !== null && node.parent !== undefined) {
      edges.push([node, idToNode[node.parent]]);
    }
  }

  return { parentToIds, idToParent, idToNode, idToDepth, edges, idToDepthIndex, depthToNodes };
};

const X = () => {
  const svgRef = React.useRef();

  React.useEffect(() => {
    if (svgRef.current) {
      const xx = svgPanZoom(svgRef.current);
      xx.zoom(1);
    }
  }, [svgRef.current]);

  const nodes: DAGNode[] = [{ id: 0 }];

  for (let d = 1; d < 5; d++) {
    nodes.push({ id: d, parent: 0 });
    for (let i = 1; i < 5; i++) {
      nodes.push({ id: d * 100 + i, parent: d });
    }
  }
  //[{ id: 0 }, { id: 1, parent: 0 }, { id: 2, parent: 0 }];

  const y = xxx(nodes);

  return (
    <svg version="1.1" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
      <g transform="scale(1)">
        {y.nodes.map((n) => (
          <NodeComponent node={n} key={n.node.id} />
        ))}
        {y.edges.map((n) => (
          <EdgeComponent from={n.from} to={n.to} key={`${n.from.node.id}-${n.to.node.id}`} />
        ))}
      </g>
    </svg>
  );
};

interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  index: number;
  node: DAGNode;
}

const NodeComponent = (props: { node: Node; key?: number }): React.Element => {
  return (
    <g>
      <rect width={props.node.width} height={props.node.height} x={props.node.x} y={props.node.y} fill="orange" />
      <text x={props.node.x + 50} y={props.node.y + 25} fontSize="10" textAnchor="middle" fill="black">
        {props.node.node.id.toLocaleString()} xxx
      </text>
    </g>
  );
};

const EdgeComponent = (props: { from: Node; to: Node; key?: string }) => {
  const isAbove = props.from.y > props.to.y;
  const from_x = props.from.x + props.from.width / 2;
  const from_y = props.from.y + (isAbove ? 0 : props.from.height);

  const to_x = props.to.x + props.to.width / 2;
  const to_y = props.to.y + (isAbove ? props.to.height : 0);

  const mid_y = Math.abs(to_y - from_y) / 2 + props.from.index * 5;

  return (
    <path
      d={`M ${from_x} ${from_y} V ${from_y - mid_y}  H ${to_x} L ${to_x} ${to_y}`}
      stroke="black"
      fill="transparent"
    />
  );
};

export const doit = () => {
  render(<X />, document.getElementById("out"));
};
