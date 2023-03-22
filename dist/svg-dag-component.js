"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeComponent = exports.NodeComponent = exports.DAGSVGComponent = exports.generateNodesAndEdges = exports.defaultConfiguration = void 0;
const React = require("react");
const svgPanZoom = require("svg-pan-zoom");
const react_error_boundary_1 = require("react-error-boundary");
const debug_1 = require("debug");
const resize_observer_polyfill_1 = require("resize-observer-polyfill");
const dagre = require("dagre");
const logger = (0, debug_1.default)("react-svg-dag");
exports.defaultConfiguration = {
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
const generateNodesAndEdges = (dagNodes, config) => {
    var _a, _b, _c, _d, _e;
    const g = new dagre.graphlib.Graph({ directed: true });
    const nodes = new Map();
    g.setGraph((_a = config.dagreOptions) !== null && _a !== void 0 ? _a : {});
    g.setDefaultEdgeLabel(() => { return {}; });
    for (const n of dagNodes) {
        if (nodes.has(n.id))
            throw new Error(`duplicate node ${n.id}`);
        g.setNode(n.id.toString(), { label: (_b = n.title) !== null && _b !== void 0 ? _b : "", width: (_c = n.width) !== null && _c !== void 0 ? _c : config.width, height: (_d = n.height) !== null && _d !== void 0 ? _d : config.height });
        nodes.set(n.id, n);
    }
    for (const n of dagNodes) {
        for (const p of (_e = n.parents) !== null && _e !== void 0 ? _e : []) {
            g.setEdge({ v: p.toString(), w: n.id.toString() });
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
            };
        }),
        edges: g.edges().map((e_id) => {
            const { points } = g.edge(e_id);
            return {
                points,
                from: nodes.get(parseInt(e_id.v, 10)),
                to: nodes.get(parseInt(e_id.w, 10)),
            };
        })
    };
};
exports.generateNodesAndEdges = generateNodesAndEdges;
const useResizeObserver = (callback, elementRef) => {
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
        const resizeObserverOrPolyfill = resize_observer_polyfill_1.default;
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
exports.DAGSVGComponent = React.forwardRef((props, ref) => {
    var _a, _b;
    const [selectedNodeId, setSelectedNodeId] = React.useState();
    const configuration = React.useMemo(() => {
        var _a;
        return Object.assign(Object.assign({}, exports.defaultConfiguration), ((_a = props.configuration) !== null && _a !== void 0 ? _a : {}));
    }, [props.nodes, props.configuration]);
    const dag = React.useMemo(() => {
        var _a;
        return (0, exports.generateNodesAndEdges)((_a = props.nodes) !== null && _a !== void 0 ? _a : [], configuration);
    }, [props.nodes, configuration]);
    const svgRef = React.useRef();
    const htmlRef = React.useRef();
    React.useImperativeHandle(ref, () => htmlRef.current);
    const panZoomInstance = React.useRef();
    const handleSvgRef = React.useCallback((elem) => {
        svgRef.current = elem;
        if (svgRef.current && configuration.enablePanZoom && !panZoomInstance.current) {
            panZoomInstance.current = svgPanZoom(svgRef.current, configuration.panZoomOptions);
            if (props.onPanZoomInit) {
                logger("[onPanZoomInit] Fired");
                props.onPanZoomInit(panZoomInstance.current);
            }
        }
    }, [configuration, panZoomInstance]);
    React.useEffect(() => {
        var _a;
        if (selectedNodeId && panZoomInstance.current && configuration.autoCenterSelectedNode) {
            const node = (_a = dag.nodes) === null || _a === void 0 ? void 0 : _a.filter((n) => n.node.id === selectedNodeId)[0];
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
    const handleClick = React.useCallback((node) => {
        if (props.onClick) {
            props.onClick(node);
        }
        setSelectedNodeId(node.node.id);
    }, [setSelectedNodeId, props.onClick]);
    const defaultRenderNode = React.useCallback((node) => React.createElement(exports.NodeComponent, Object.assign({}, node)), []);
    const defaultRenderEdge = React.useCallback((edge) => (React.createElement(exports.EdgeComponent
    // from={edge.from}
    // to={edge.to}
    , { 
        // from={edge.from}
        // to={edge.to}
        points: edge.points, key: `edge-${edge.from}-${edge.to}`, configuration: configuration, selected: selectedNodeId === edge.from.id || selectedNodeId === edge.to.id })), [configuration, selectedNodeId]);
    const onResize = React.useCallback(() => {
        if (panZoomInstance.current) {
            panZoomInstance.current.resize();
            panZoomInstance.current.fit();
            panZoomInstance.current.center();
        }
    }, []);
    useResizeObserver(onResize, htmlRef);
    const renderNode = props.renderNode ? props.renderNode : defaultRenderNode;
    const renderEdge = props.renderEdge ? props.renderEdge : defaultRenderEdge;
    return (dag && (React.createElement("div", { ref: htmlRef },
        React.createElement("svg", { version: "1.1", ref: handleSvgRef, style: props.style || {} },
            React.createElement("g", null, (_a = dag === null || dag === void 0 ? void 0 : dag.edges) === null || _a === void 0 ? void 0 :
                _a.map((edge, idx) => {
                    try {
                        return (React.createElement(react_error_boundary_1.ErrorBoundary, { key: idx, fallbackRender: () => null }, renderEdge(edge, edge.from.id === selectedNodeId || edge.to.id === selectedNodeId)));
                    }
                    catch (e) {
                        logger("[renderEdge] Unable to render edge", edge, e);
                    }
                }), (_b = dag === null || dag === void 0 ? void 0 : dag.nodes) === null || _b === void 0 ? void 0 :
                _b.map((node, idx) => {
                    try {
                        return (React.createElement(react_error_boundary_1.ErrorBoundary, { key: idx, fallbackRender: () => null }, renderNode({
                            node,
                            onClick: handleClick,
                            selected: node.node.id === selectedNodeId,
                            key: `${node.node.id}`,
                        })));
                    }
                    catch (e) {
                        logger("[renderNode] Unable to render node", node, e);
                    }
                }))))));
});
exports.DAGSVGComponent.displayName = "DAGSVGComponent";
exports.NodeComponent = React.memo((props) => {
    const onClick = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClick && props.onClick(props.node);
    }, [props.onClick]);
    return (React.createElement("g", { onClick: onClick },
        React.createElement("rect", { width: props.node.width, height: props.node.height, x: props.node.x - props.node.width / 2, y: props.node.y - props.node.height / 2, fill: props.selected ? "orange" : "white", stroke: props.selected ? "red" : "black" }),
        React.createElement("text", { x: props.node.x, y: props.node.y, fontSize: "10", textAnchor: "middle", fill: "black" }, props.node.node.title || props.node.node.id)));
});
exports.NodeComponent.displayName = "NodeComponent";
exports.EdgeComponent = React.memo((props) => {
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
    return (React.createElement("path", { d: d, stroke: props.selected ? "red" : "black", fill: "transparent" }));
});
exports.EdgeComponent.displayName = "EdgeComponent";
//# sourceMappingURL=svg-dag-component.js.map