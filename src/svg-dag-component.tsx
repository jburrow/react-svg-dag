import * as React from "react";
import * as svgPanZoom from "svg-pan-zoom";

export type IdType = number;

export interface DAGNode {
  title?: string;
  id: IdType;
  parent?: IdType;
}

export interface Configuration {
  width: number;
  height: number;
  horizontalGap: number;
  verticalGap: number;
  enablePanZoom: boolean;
  edgePadding: number;
}

export const defaultConfiguration: Configuration = {
  width: 100,
  height: 50,
  horizontalGap: 25,
  verticalGap: 50,
  enablePanZoom: true,
  edgePadding: 3,
};

const generateNodesAndEdges = (dagNodes: DAGNode[], config: Configuration) => {
  const r = calculateDepths(dagNodes);
  const nodes: Node[] = [];
  const idToNode: Record<IdType, Node> = {};

  for (let depth = r.depth; depth > -1; depth--) {
    const dagnodes = r.depthToNodes[depth] || [];

    let idx = 0;

    for (const dagnode of dagnodes) {
      const idxShift = (r.idToLeafCount[dagnode.id] || 1) / 2;

      idx += idxShift;

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
      idx += idxShift;
    }
  }

  const edges = [];
  for (const edge of r.edges) {
    edges.push({ from: idToNode[edge[0].id], to: idToNode[edge[1].id] });
  }

  return { nodes, edges };
};

const calculateDepths = (nodes: DAGNode[]) => {
  const idToNode: Record<IdType, DAGNode> = {};
  const idToParent: Record<IdType, IdType> = {};
  const idToDepth: Record<IdType, IdType> = {};
  const idToLeafCount: Record<IdType, number> = {};
  const idToDepthIndex: Record<IdType, number> = {};
  const depthToNodes: Record<number, DAGNode[]> = {};
  const parentToIds: Record<IdType, IdType[]> = {};
  const edges: [DAGNode, DAGNode][] = [];
  let maxDepth = 0;

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

    idToLeafCount[node.id] = 0;
    idToDepth[node.id] = depth;
    depthToNodes[depth].push(node);
    idToDepthIndex[node.id] = depthToNodes[depth].length;

    if (depth > maxDepth) {
      maxDepth = depth;
    }

    if (node.parent !== null && node.parent !== undefined) {
      edges.push([node, idToNode[node.parent]]);
    }
  }
  if (nodes.length) {
    for (let depth = maxDepth; depth > -1; depth--) {
      for (const node of depthToNodes[depth]) {
        idToLeafCount[node.parent] += depth === maxDepth ? 1 : idToLeafCount[node.id];
      }

      if (depth > 0) {
        depthToNodes[depth].sort((a, b) => a.parent - b.parent || a.id - b.id);
      }
    }
  }

  return {
    parentToIds,
    idToParent,
    idToNode,
    idToDepth,
    edges,
    idToDepthIndex,
    depthToNodes,
    depth: maxDepth,
    idToLeafCount,
  };
};

export const DAGSVGComponent = (props: {
  nodes: DAGNode[];
  configuration?: Configuration;
  onSVG?(element: any): void;
  onPanZoomInit?(controller: SvgPanZoom.Instance): void;
  style?: React.CSSProperties;
  renderNode?(node: Node): JSX.Element;
  renderEdge?(edge: Edge): JSX.Element;
}) => {
  const configuration = props.configuration || defaultConfiguration;
  const svgRef = React.useRef<SVGSVGElement>();

  const renderNode = props.renderNode
    ? props.renderNode
    : (node: Node) => <NodeComponent node={node} key={`${node.node.id}`} />;
  const renderEdge = props.renderEdge
    ? props.renderEdge
    : (edge: Edge) => (
        <EdgeComponent
          from={edge.from}
          to={edge.to}
          key={`${edge.from.node.id}-${edge.to.node.id}`}
          configuration={configuration}
        />
      );

  React.useEffect(() => {
    if (svgRef.current) {
      if (props.onSVG) {
        props.onSVG(svgRef.current);
      }

      if (configuration.enablePanZoom) {
        const controller = svgPanZoom(svgRef.current);
        controller.setMinZoom(0.25);
        controller.setMaxZoom(2.5);
        controller.setZoomScaleSensitivity(1.5);
        if (props.onPanZoomInit) {
          props.onPanZoomInit(controller);
        }
      }
    }
  }, [svgRef.current]);

  const dag = generateNodesAndEdges(props.nodes, configuration);

  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" ref={svgRef} style={props.style || {}}>
      <g>
        {dag.nodes.map(renderNode)}
        {dag.edges.map(renderEdge)}
      </g>
    </svg>
  );
};

export interface Edge {
  to: Node;
  from: Node;
}

export interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  index: number;
  node: DAGNode;
}

export const NodeComponent = (props: { node: Node; key?: string }): JSX.Element => {
  return (
    <g>
      <rect
        width={props.node.width}
        height={props.node.height}
        x={props.node.x}
        y={props.node.y}
        fill="white"
        stroke="black"
      />
      <text
        x={props.node.x + props.node.width / 2}
        y={props.node.y + props.node.height / 2}
        fontSize="10"
        textAnchor="middle"
        fill="black"
      >
        {props.node.node.title || props.node.node.id}
      </text>
    </g>
  );
};

export const EdgeComponent = (props: {
  from: Node;
  to: Node;
  key?: string;
  configuration: Configuration;
}): JSX.Element => {
  const isAbove = props.from.y > props.to.y;
  const from_x = props.from.x + props.from.width / 2;
  const from_y = props.from.y + (isAbove ? 0 : props.from.height);

  const to_x = props.to.x + props.to.width / 2;
  const to_y = props.to.y + (isAbove ? props.to.height : 0);

  const mid_y = Math.abs(to_y - from_y) / 2 + props.from.index * props.configuration.edgePadding;

  return (
    <path
      d={`M ${from_x} ${from_y} V ${from_y - mid_y}  H ${to_x} L ${to_x} ${to_y}`}
      stroke="black"
      fill="transparent"
    />
  );
};
