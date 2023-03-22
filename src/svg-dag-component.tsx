import * as React from "react";
import * as svgPanZoom from "svg-pan-zoom";
import { ErrorBoundary } from "react-error-boundary";
import debug from "debug";
import ResizeObserver from "resize-observer-polyfill";
import * as dagre from "dagre";

const logger = debug("react-svg-dag");

export type NodeIdType = number;

export interface DAGNode {
  title?: string;
  id: NodeIdType;
  parents?: NodeIdType[];
  width?: number;
  height?: number;
}

export interface Configuration {
  /** Default node width */
  width?: number;
  /** Default node height */
  height?: number;
  horizontalGap?: number;
  verticalGap?: number;
  enablePanZoom?: boolean;
  edgePadding?: number;
  dagreOptions?: dagre.GraphLabel,
  panZoomOptions?: SvgPanZoom.Options;
  autoCenterSelectedNode?: boolean;
}

export const defaultConfiguration: Configuration = {
  width: 250,
  height: 40,
  enablePanZoom: true,
  edgePadding: 3,
  autoCenterSelectedNode: true,
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
}

export const generateNodesAndEdges = (dagNodes: DAGNode[], config: Configuration): GenerateNodesAndEdgesResult => {
  const g = new dagre.graphlib.Graph({directed: true});
  const nodes = new Map<number, DAGNode>();
  g.setGraph(config.dagreOptions ?? {});
  g.setDefaultEdgeLabel(() => {return {} });
  for (const n of dagNodes) {
    if (nodes.has(n.id)) throw new Error(`duplicate node ${n.id}`);
    g.setNode(n.id.toString(), {label: n.title ?? "", width: n.width ??config.width, height: n.height ?? config.height});
    nodes.set(n.id, n);
  }
  for (const n of dagNodes) {
    for (const p of n.parents ?? []) {
      g.setEdge({v: p.toString(), w: n.id.toString()});
    }
  }
  dagre.layout(g, {}); //{width: config.width, height: config.height});
  return {
    nodes: g.nodes().map((n_id, i) => {
      const n = g.node(n_id);
      return {
        width: n.width,
        height: n.height,
        x: n.x,
        y: n.y,
        index: i,
        node: nodes.get(parseInt(n_id, 10))
    };}),
    edges: g.edges().map((e_id) => {
      const {points} = g.edge(e_id);
      return {
        points,
        from: nodes.get(parseInt(e_id.v, 10)),
        to: nodes.get(parseInt(e_id.w, 10)),
      }
    })

  };

}

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

export type DAGEdge = { from: NodeIdType; to: NodeIdType };

export const DAGSVGComponent = React.forwardRef((props: {
  nodes: DAGNode[];
  configuration?: Configuration;
  onSVG?(element: any): void;
  onPanZoomInit?(controller: SvgPanZoom.Instance): void;
  style?: React.CSSProperties;
  renderNode?(props: NodeComponentProps): JSX.Element;
  renderEdge?(edge: Edge, selected: boolean): JSX.Element;
  onClick?(node: Node): void;
  selectedNode?: NodeIdType;
}, ref) => {
  const [selectedNodeId, setSelectedNodeId] = React.useState<NodeIdType|undefined>();
  const configuration = React.useMemo(() => {
    return {...defaultConfiguration, ...(props.configuration ?? {})};
  }, [props.nodes, props.configuration]);

  const dag = React.useMemo(() => {
    return generateNodesAndEdges(props.nodes ?? [], configuration)
  }, [props.nodes, configuration]);

  const svgRef = React.useRef<SVGSVGElement>();
  const htmlRef = React.useRef<HTMLDivElement>();
  React.useImperativeHandle(ref, () => htmlRef.current);
  const panZoomInstance = React.useRef<SvgPanZoom.Instance>();

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
    if (selectedNodeId && panZoomInstance.current && configuration.autoCenterSelectedNode) {
      const node = dag.nodes?.filter((n) => n.node.id === selectedNodeId)[0];
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
      setSelectedNodeId(node.node.id);
    },
    [setSelectedNodeId, props.onClick]
  );

  const defaultRenderNode = React.useCallback((node: NodeComponentProps) => <NodeComponent {...node} />, []);
  const defaultRenderEdge = React.useCallback(
    (edge: Edge) => (
      <EdgeComponent
        // from={edge.from}
        // to={edge.to}
        points={edge.points}
        key={`edge-${edge.from}-${edge.to}`}
        configuration={configuration}
        selected={selectedNodeId === edge.from.id || selectedNodeId === edge.to.id}
      />
    ),
    [configuration, selectedNodeId]
  );

  const onResize = React.useCallback(() => {
      if (panZoomInstance.current) {
        panZoomInstance.current.resize();
        panZoomInstance.current.fit();
        panZoomInstance.current.center();
      }
  }, [])
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
                  {renderEdge(edge, edge.from.id === selectedNodeId || edge.to.id === selectedNodeId)}
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
                    selected: node.node.id === selectedNodeId,
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
  points: {x:number, y:number}[];
  from: DAGNode;
  to: DAGNode;
}

export interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
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
        x={props.node.x - props.node.width/2}
        y={props.node.y - props.node.height/2}
        fill={props.selected ? "orange" : "white"}
        stroke={props.selected ? "red" : "black"}
      />
      <text
        x={props.node.x}
        y={props.node.y}
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
  points: {x: number, y:number}[],
  key?: string;
  configuration: Configuration;
  selected: boolean;
}): JSX.Element => {
  // const isAbove = props.from.y > props.to.y;
  // const from_x = props.from.x + props.from.width / 2;
  // const from_y = props.from.y + (isAbove ? 0 : props.from.height);

  // const to_x = props.to.x + props.to.width / 2;
  // const to_y = props.to.y + (isAbove ? props.to.height : 0);

  // const mid_y = Math.abs(to_y - from_y) / 2 + props.from.index * props.configuration.edgePadding;
  const d = props.points.map((p, i) => {
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    if (i == 0) {
      return `M ${p.x} ${p.y}`;
    }
    return `L ${p.x} ${p.y}`;
  }).join(" ");

  return (
    <path
      d={d}
      stroke={props.selected ? "red" : "black"}
      fill="transparent"
    />
  );
});
EdgeComponent.displayName = "EdgeComponent";
