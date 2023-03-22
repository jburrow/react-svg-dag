import * as React from "react";
import * as svgPanZoom from "svg-pan-zoom";
import { ErrorBoundary } from "react-error-boundary";
import debug from "debug";
import ResizeObserver from "resize-observer-polyfill";

const logger = debug("react-svg-dag");

export type IdType = number;

export interface DAGNode {
  title?: string;
  id: IdType;
  parents?: IdType[];
}

export interface Configuration {
  width?: number;
  height?: number;
  horizontalGap?: number;
  verticalGap?: number;
  enablePanZoom?: boolean;
  edgePadding?: number;
  panZoomOptions?: SvgPanZoom.Options;
  autoCenterSelectedNode?: boolean;
  autoSelectNode?: boolean;
}

export const defaultConfiguration: Configuration = {
  width: 100,
  height: 50,
  horizontalGap: 25,
  verticalGap: 50,
  enablePanZoom: true,
  edgePadding: 3,
  autoCenterSelectedNode: true,
  autoSelectNode: true,
  panZoomOptions: {
    fit: true,
    minZoom: 0.25,
    zoomScaleSensitivity: 1.5,
    center: true,
    controlIconsEnabled: true,
  },
};

interface GenerateNodesAndEdgesResult {
  nodes: Node[];
  edges: Edge[];
  selectedNode?: number;
}

export const generateNodesAndEdges = (dagNodes: DAGNode[], config: Configuration): GenerateNodesAndEdgesResult => {
  const r = calculateDepths(dagNodes);
  const nodes: Node[] = [];
  const idToNode: Record<IdType, Node> = {};

  for (let depth = r.depth - 1; depth > -1; depth--) {
    const dagnodes = r.depthToNodes[depth] || [];

    const initialRowOffset = r.maxNumberOfNodesInRow - dagnodes.length;
    let idx = initialRowOffset ? initialRowOffset / 2 : 0;

    for (const dagnode of dagnodes) {
      const idxShift = (r.idToLeafCount[dagnode.id] || 1) / 2;

      idx += idxShift;

      const parents = r.idToParentIds[dagnode.id];
      const index =
        parents?.length > 0 && r.parentToIds[parents[0]]?.length > 0
          ? r.parentToIds[parents[0]].indexOf(dagnode.id)
          : 0;

      const n: Node = {
        depth,
        height: config.height,
        width: config.width,
        x: (config.width + config.horizontalGap) * idx,
        y: (config.height + config.verticalGap) * depth,
        node: dagnode,
        index,
      };

      nodes.push(n);
      idToNode[dagnode.id] = n;
      idx += idxShift;
    }
  }

  const edges: Edge[] = [];
  for (const edge of r.edges) {
    edges.push({ from: idToNode[edge[0].id], to: idToNode[edge[1].id] });
  }

  return { nodes, edges };
};

const calculateMaxDepth = (
  node: DAGNode,
  idToNode: Record<IdType, DAGNode>,
  idToParentIds: Record<IdType, number[]>,
  depth: number,
  seenIds?: Record<IdType, boolean>
) => {
  let resultDepth = depth;
  seenIds = seenIds || {};
  if (node && !seenIds[node.id]) {
    seenIds[node.id] = true;
    const parents = idToParentIds[node.id];
    if (parents?.length > 0) {
      for (const parent of parents) {
        const tmpDepth = calculateMaxDepth(idToNode[parent], idToNode, idToParentIds, depth + 1, seenIds);
        if (tmpDepth > resultDepth) {
          resultDepth = tmpDepth;
        }
      }
    }
  }

  return resultDepth;
};

export const calculateDepths = (nodes: DAGNode[]) => {
  const idToNode: Record<IdType, DAGNode> = {};
  const idToDepth: Record<IdType, IdType> = {};
  const idToLeafCount: Record<IdType, number> = {};
  const idToDepthIndex: Record<IdType, number> = {};
  const idToParentIds: Record<IdType, number[]> = {};
  const depthToNodes: Record<number, DAGNode[]> = {};
  const parentToIds: Record<IdType, IdType[]> = {};
  const edges: [DAGNode, DAGNode][] = [];
  let maxDepth = 0;

  for (const node of nodes) {
    idToNode[node.id] = node;

    if (Array.isArray(node.parents)) {
      //TODO : Do we want a type filter?
      idToParentIds[node.id] = node.parents?.filter((p) => p != null && p !== undefined && typeof p === "number") || [];
    } else {
      idToParentIds[node.id] = [];
    }
  }

  for (const node of nodes) {
    const afterFilter = idToParentIds[node.id].filter((p) => idToNode[p]);
    if (afterFilter.length !== idToParentIds[node.id].length) {
      logger(
        `[discarded-invalid-parents] ${node.id} had invalid parent-ids filtered ${
          idToParentIds[node.id]
        } => ${afterFilter}`
      );
      idToParentIds[node.id] = afterFilter;
    }
  }

  for (const node of nodes) {
    const depth = calculateMaxDepth(node, idToNode, idToParentIds, 0);

    for (let d = 0; d < depth + 1; d++) {
      if (depthToNodes[d] === undefined) {
        depthToNodes[d] = [];
      }
    }

    idToLeafCount[node.id] = 0;
    idToDepth[node.id] = depth;
    depthToNodes[depth].push(node);
    idToDepthIndex[node.id] = depthToNodes[depth].length;

    if (depth > maxDepth) {
      maxDepth = depth;
    }

    for (const parent of idToParentIds[node.id]) {
      if (idToNode[parent]) {
        edges.push([node, idToNode[parent]]);
      } else {
        logger("[define-edge] Unable to find a node ", parent, "Known nodes:", Object.keys(idToNode));
      }
    }
  }
  let maxNumberOfNodesInRow = 0;
  if (nodes.length) {
    for (let depth = maxDepth; depth > -1; depth--) {
      for (const node of depthToNodes[depth]) {
        idToParentIds[node.id]
          .filter((p) => idToDepth[p] === p[node.id] - 1)
          .map((parent) => {
            idToLeafCount[parent] += depth === maxDepth ? 1 : idToLeafCount[node.id];
          });
      }
      if (depthToNodes[depth].length > maxNumberOfNodesInRow) {
        maxNumberOfNodesInRow = depthToNodes[depth].length;
      }

      if (depth > 0) {
        depthToNodes[depth].sort((a, b) => {
          try {
            const ap = idToParentIds[a.id].length ? idToParentIds[a.id][0] : 0;
            const bp = idToParentIds[b.id].length ? idToParentIds[b.id][0] : 0;

            return ap - bp || a.id - b.id;
          } catch {
            return 0;
          }
        });
      }
    }
  }

  for (const node of nodes) {
    for (const parentId of idToParentIds[node.id]) {
      if (!parentToIds[parentId]) {
        parentToIds[parentId] = [];
      }
      parentToIds[parentId].push(node.id);
    }
  }

  return {
    parentToIds,
    maxNumberOfNodesInRow,
    idToNode,
    idToDepth,
    edges,
    idToDepthIndex,
    idToParentIds,
    depthToNodes,
    depth: maxDepth + 1,
    idToLeafCount,
  };
};


const useResizeObserver = (callback: () => void, elementRef: React.MutableRefObject<Element>) => {
  // https://eymas.medium.com/react-hooks-useobserve-use-resizeobserver-custom-hook-45ec95ad9844

  const current = elementRef && elementRef.current;

  const observer = React.useRef(null);

  const observe = React.useCallback(() => {
      if (elementRef && elementRef.current && observer.current) {
          observer.current.observe(elementRef.current);
      }
  }, [elementRef, observer]);

  React.useEffect(() => {
      // if we are already observing old element
      if (observer && observer.current && current) {
          observer.current.unobserve(current);
      }
      const resizeObserverOrPolyfill = ResizeObserver;
      observer.current = new resizeObserverOrPolyfill(callback);
      observe();
      const old = elementRef.current;

      return () => {
          if (observer && observer.current && elementRef && old) {
              observer.current.unobserve(old);
          }
      };
  }, [current, callback, observe, elementRef]);

};

export type DAGEdge = { from: IdType; to: IdType };

export const DAGSVGComponent = React.forwardRef((props: {
  nodes: DAGNode[];
  configuration?: Configuration;
  onSVG?(element: any): void;
  onPanZoomInit?(controller: SvgPanZoom.Instance): void;
  style?: React.CSSProperties;
  renderNode?(props: NodeComponentProps): JSX.Element;
  renderEdge?(edge: Edge, selected: boolean): JSX.Element;
  onClick?(node: Node): void;
  selectedNode?: IdType;
}, ref) => {
  const [configuration, setConfiguration] = React.useState<Configuration>();
  const [dag, setDag] = React.useState<GenerateNodesAndEdgesResult>(null);
  const svgRef = React.useRef<SVGSVGElement>();
  const htmlRef = React.useRef<HTMLDivElement>();
  React.useImperativeHandle(ref, () => htmlRef.current);
  const panZoomInstance = React.useRef<SvgPanZoom.Instance>();

  React.useEffect(() => {
    const cleanPropConfig = Object.fromEntries(
      Object.entries(props.configuration || {}).filter(([_key, value]) => value !== undefined && value !== null)
    );

    const c: Configuration = { ...defaultConfiguration, ...cleanPropConfig };

    if (JSON.stringify(c) !== JSON.stringify(configuration)) {
      logger("[configuration] Merging prop.configuration + updating", cleanPropConfig, "merged config:", c);
      setConfiguration(c);
    }
  }, [props.configuration, configuration]);

  const setSelectedNodeAndSortEdges = React.useCallback((sn: number | null) => {
    setDag((dag_) => {
      return { ...dag_, edges: sortEdges(dag_.edges, sn), selectedNode: sn };
    });
  }, []);

  React.useEffect(() => {
    if (dag) {
      if (dag.selectedNode == null && configuration.autoSelectNode && dag.nodes.length) {
        logger("[selectedNode] defaulting to first", dag.selectedNode);
        setSelectedNodeAndSortEdges(dag.nodes[dag.nodes.length - 1].node.id);
      } else if (props.selectedNode && dag.selectedNode !== props.selectedNode) {
        logger("[selectedNode] prop changed", props.selectedNode, dag?.selectedNode);
        setSelectedNodeAndSortEdges(props.selectedNode);
      }
    }
  }, [setSelectedNodeAndSortEdges, props.selectedNode, dag, configuration]);

  React.useEffect(() => {
    if (configuration) {
      logger("[calculate-dag]");
      setDag(generateNodesAndEdges(props.nodes, configuration));
    }
  }, [props.nodes, configuration]);

  const handleSvgRef = React.useCallback(
    (elem) => {
      svgRef.current = elem;
      if (svgRef.current && configuration.enablePanZoom && !panZoomInstance.current) {
        panZoomInstance.current = svgPanZoom(svgRef.current, configuration.panZoomOptions);

        if (props.onPanZoomInit) {
          logger("[onPanZoomInit] Fired");
          props.onPanZoomInit(panZoomInstance.current);
        }
      }
    },
    [configuration, panZoomInstance]
  );

  React.useEffect(() => {
    if (dag?.selectedNode && panZoomInstance.current && configuration.autoCenterSelectedNode) {
      const node = dag.nodes?.filter((n) => n.node.id === dag.selectedNode)[0];
      if (node) {
        const sizes = panZoomInstance.current.getSizes();
        const zoom = panZoomInstance.current.getZoom();

        const halfWidth = sizes.viewBox.width / 2 + node.width / 2;
        const halfHeight = sizes.viewBox.height / 2 - node.height / 2;

        const x = -(node.x - halfWidth);
        const y = -(node.y - halfHeight);
        // HACK - This should be do-able in one transition
        panZoomInstance.current.zoomAtPoint(1, { x, y });
        panZoomInstance.current.pan({ x, y });
        panZoomInstance.current.zoom(zoom);
      }
    }
  }, [dag, configuration]);

  const handleClick = React.useCallback(
    (node: Node) => {
      if (props.onClick) {
        props.onClick(node);
      }
      setSelectedNodeAndSortEdges(node.node.id);
    },
    [setSelectedNodeAndSortEdges, props.onClick]
  );

  const defaultRenderNode = React.useCallback((node: NodeComponentProps) => <NodeComponent {...node} />, []);
  const defaultRenderEdge = React.useCallback(
    (edge: Edge) => (
      <EdgeComponent
        from={edge.from}
        to={edge.to}
        key={`${edge.from.node.id}-${edge.to.node.id}`}
        configuration={configuration}
        selected={dag.selectedNode === edge.from.node.id || dag.selectedNode === edge.to.node.id}
      />
    ),
    [configuration, dag?.selectedNode]
  );

  const onResize = React.useCallback(() => {
      if (panZoomInstance.current) {
        panZoomInstance.current.resize();
        panZoomInstance.current.fit();
        panZoomInstance.current.center();
      }
  }, [])
  //useResizeObserver(svgRef, onResize);
  useResizeObserver(onResize, htmlRef);



  const renderNode = props.renderNode ? props.renderNode : defaultRenderNode;
  const renderEdge = props.renderEdge ? props.renderEdge : defaultRenderEdge;

  return (
    dag && (
      <div ref={htmlRef}>
      <svg version="1.1" ref={handleSvgRef} style={props.style || {}}>
        <g>
          {dag?.edges?.map((edge, idx) => {
            try {
              return (
                <ErrorBoundary key={idx} fallbackRender={() => null}>
                  {renderEdge(edge, edge.from.node.id === dag.selectedNode || edge.to.node.id === dag.selectedNode)}
                </ErrorBoundary>
              );
            } catch (e) {
              logger("[renderEdge] Unable to render edge", edge, e);
            }
          })}
          {dag?.nodes?.map((node, idx) => {
            try {
              return (
                <ErrorBoundary key={idx} fallbackRender={() => null}>
                  {renderNode({
                    node,
                    onClick: handleClick,
                    selected: node.node.id === dag.selectedNode,
                    key: `${node.node.id}`,
                  })}
                </ErrorBoundary>
              );
            } catch (e) {
              logger("[renderNode] Unable to render node", node, e);
            }
          })}
        </g>
      </svg>
      </div>
    )
  );
});
DAGSVGComponent.displayName = "DAGSVGComponent";

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

export interface NodeComponentProps {
  node: Node;
  key?: string;
  onClick?(node: Node): void;
  selected: boolean;
}

export const NodeComponent = React.memo((props: NodeComponentProps): JSX.Element => {
  const onClick = React.useCallback((e: React.MouseEvent<SVGGElement, MouseEvent>): void => {
    e.preventDefault();
    e.stopPropagation();
    props.onClick && props.onClick(props.node);
  }, [props.onClick]);
  return (
    <g
      onClick={onClick}
    >
      <rect
        width={props.node.width}
        height={props.node.height}
        x={props.node.x}
        y={props.node.y}
        fill={props.selected ? "orange" : "white"}
        stroke={props.selected ? "red" : "black"}
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
});
NodeComponent.displayName = "NodeComponent";

export const EdgeComponent = React.memo((props: {
  from: Node;
  to: Node;
  key?: string;
  configuration: Configuration;
  selected: boolean;
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
      stroke={props.selected ? "red" : "black"}
      fill="transparent"
    />
  );
});
EdgeComponent.displayName = "EdgeComponent";

function sortEdges(edges: Edge[], selectedNode: number) {
  // We need to sort the edges so the selected edge can render on top of each other

  if (selectedNode) {
    const other: Edge[] = [];
    const last: Edge[] = [];

    for (const e of edges) {
      if (e.from.node.id === selectedNode || e.to.node.id === selectedNode) {
        last.push(e);
      } else {
        other.push(e);
      }
    }
    return other.concat(last);
  }

  return edges;
}
