"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeComponent = exports.NodeComponent = exports.DAGSVGComponent = exports.defaultConfiguration = void 0;
const React = require("react");
const svgPanZoom = require("svg-pan-zoom");
exports.defaultConfiguration = {
    width: 100,
    height: 50,
    horizontalGap: 25,
    verticalGap: 50,
    enablePanZoom: true,
    edgePadding: 3,
    panZoomOptions: {
        fit: true,
        minZoom: 0.25,
        zoomScaleSensitivity: 1.5,
        center: true,
        controlIconsEnabled: true,
    },
};
const generateNodesAndEdges = (dagNodes, config) => {
    var _a;
    const r = calculateDepths(dagNodes);
    const nodes = [];
    const idToNode = {};
    console.log("parentToIds", r);
    for (let depth = r.depth; depth > -1; depth--) {
        const dagnodes = r.depthToNodes[depth] || [];
        const x = r.maxNumberOfNodesInRow - dagnodes.length;
        let idx = x ? x / 2 : 0;
        //(r.maxNumberOfNodesInRow - dagnodes.length)/2
        for (const dagnode of dagnodes) {
            const idxShift = (r.idToLeafCount[dagnode.id] || 1) / 2;
            idx += idxShift;
            const n = {
                depth,
                height: config.height,
                width: config.width,
                x: (config.width + config.horizontalGap) * idx,
                y: (config.height + config.verticalGap) * depth,
                node: dagnode,
                index: ((_a = dagnode.parents) === null || _a === void 0 ? void 0 : _a.length) > 0 ? r.parentToIds[dagnode.parents[0]].indexOf(dagnode.id) : 0,
            };
            // index : first parent? ^^
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
const calculateMaxDepth = (node, idToNode, depth) => {
    var _a;
    let resultDepth = depth;
    if (((_a = node === null || node === void 0 ? void 0 : node.parents) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        for (const parent of node.parents) {
            const tmpDepth = calculateMaxDepth(idToNode[parent], idToNode, depth + 1);
            if (tmpDepth > resultDepth) {
                resultDepth = tmpDepth;
            }
        }
    }
    return resultDepth;
};
const calculateDepths = (nodes) => {
    var _a, _b, _c;
    const idToNode = {};
    const idToDepth = {};
    const idToLeafCount = {};
    const idToDepthIndex = {};
    const depthToNodes = {};
    const parentToIds = {};
    const edges = [];
    let maxDepth = 0;
    for (const node of nodes) {
        idToNode[node.id] = node;
    }
    for (const node of nodes) {
        const depth = calculateMaxDepth(node, idToNode, 0);
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
        if ((_a = node.parents) === null || _a === void 0 ? void 0 : _a.length) {
            for (const parent of node.parents) {
                edges.push([node, idToNode[parent]]);
            }
        }
    }
    let maxNumberOfNodesInRow = 0;
    if (nodes.length) {
        for (let depth = maxDepth; depth > -1; depth--) {
            for (const node of depthToNodes[depth]) {
                if ((_b = node.parents) === null || _b === void 0 ? void 0 : _b.length) {
                    for (const parent of node.parents) {
                        // console.log("[x]", depth, "parent", parent, idToDepth[parent], "Current", node.id, idToDepth[node.id]);
                        if (idToDepth[parent] === parent[node.id] - 1) {
                            idToLeafCount[parent] += depth === maxDepth ? 1 : idToLeafCount[node.id];
                        }
                    }
                }
            }
            if (depthToNodes[depth].length > maxNumberOfNodesInRow) {
                maxNumberOfNodesInRow = depthToNodes[depth].length;
            }
            if (depth > 0) {
                //depthToNodes[depth].sort((a, b) => a.parent - b.parent || a.id - b.id);
            }
        }
    }
    for (const node of nodes) {
        if ((_c = node.parents) === null || _c === void 0 ? void 0 : _c.length) {
            for (const parentId of node.parents) {
                if (!parentToIds[parentId]) {
                    parentToIds[parentId] = [];
                }
                parentToIds[parentId].push(node.id);
            }
        }
    }
    return {
        parentToIds,
        maxNumberOfNodesInRow,
        idToNode,
        idToDepth,
        edges,
        idToDepthIndex,
        depthToNodes,
        depth: maxDepth,
        idToLeafCount,
    };
};
const DAGSVGComponent = (props) => {
    const configuration = props.configuration || exports.defaultConfiguration;
    const svgRef = React.useRef();
    const panZoomInstance = React.useRef();
    const [selectedNode, setSelectedNode] = React.useState();
    React.useEffect(() => {
        setSelectedNode(props.selectedNode);
    }, [props.selectedNode]);
    const handleClick = React.useCallback((node) => {
        console.log("[handleClick]", node.x, node.y);
        if (props.onClick) {
            props.onClick(node);
        }
        setSelectedNode(node.node.id);
        // panZoomInstance.current?.zoomAtPoint(1, { x: node.x, y: node.y });
        //const point = svgRef.current.createSVGPoint();
        //const x = svgRef.current.getElementsByClassName("svg-pan-zoom_viewport");
        //console.log(x);
        //const oldCTM = (panZoomInstance.current as any).viewport.getCTM();
        //console.log("[handleClick]", svgRef.current, oldCTM);
        //(window as any).controller = panZoomInstance.current;
        // relativePoint = point.matrixTransform(oldCTM.inverse()),
        // modifier = this.svg
        //   .createSVGMatrix()
        //   .translate(relativePoint.x, relativePoint.y)
        //   .scale(zoomScale)
        //   .translate(-relativePoint.x, -relativePoint.y);
    }, []);
    const renderNode = props.renderNode ? props.renderNode : (x) => React.createElement(exports.NodeComponent, Object.assign({}, x));
    const renderEdge = props.renderEdge
        ? props.renderEdge
        : (edge) => (React.createElement(exports.EdgeComponent, { from: edge.from, to: edge.to, key: `${edge.from.node.id}-${edge.to.node.id}`, configuration: configuration, selected: selectedNode === edge.from.node.id || selectedNode === edge.to.node.id }));
    React.useEffect(() => {
        if (svgRef.current) {
            if (props.onSVG) {
                props.onSVG(svgRef.current);
            }
            if (configuration.enablePanZoom) {
                panZoomInstance.current = svgPanZoom(svgRef.current, configuration.panZoomOptions);
                if (props.onPanZoomInit) {
                    props.onPanZoomInit(panZoomInstance.current);
                }
            }
        }
    }, [svgRef.current]);
    const dag = generateNodesAndEdges(props.nodes, configuration);
    // We need to sort the edges so the selected edge can
    let edges = dag.edges;
    if (selectedNode) {
        const other = [];
        const last = [];
        for (const e of edges) {
            if (e.from.node.id === selectedNode || e.to.node.id === selectedNode) {
                last.push(e);
            }
            else {
                other.push(e);
            }
        }
        edges = other.concat(last);
        console.log("[edges] after", edges.map((e) => `${e.from.node.id} ${e.to.node.id}`));
    }
    return (React.createElement("svg", { version: "1.1", xmlns: "http://www.w3.org/2000/svg", ref: svgRef, style: props.style || {} },
        React.createElement("g", null,
            edges.map((e) => renderEdge(e, e.from.node.id === selectedNode || e.to.node.id === selectedNode)),
            dag.nodes.map((n) => renderNode({ node: n, onClick: handleClick, selected: n.node.id === selectedNode })))));
};
exports.DAGSVGComponent = DAGSVGComponent;
const NodeComponent = (props) => {
    return (React.createElement("g", { onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            props.onClick && props.onClick(props.node);
        } },
        React.createElement("rect", { width: props.node.width, height: props.node.height, x: props.node.x, y: props.node.y, fill: props.selected ? "orange" : "white", stroke: props.selected ? "red" : "black" }),
        React.createElement("text", { x: props.node.x + props.node.width / 2, y: props.node.y + props.node.height / 2, fontSize: "10", textAnchor: "middle", fill: "black" }, props.node.node.title || props.node.node.id)));
};
exports.NodeComponent = NodeComponent;
const EdgeComponent = (props) => {
    const isAbove = props.from.y > props.to.y;
    const from_x = props.from.x + props.from.width / 2;
    const from_y = props.from.y + (isAbove ? 0 : props.from.height);
    const to_x = props.to.x + props.to.width / 2;
    const to_y = props.to.y + (isAbove ? props.to.height : 0);
    const mid_y = Math.abs(to_y - from_y) / 2 + props.from.index * props.configuration.edgePadding;
    console.log("[edge]", props.from.node.id, props.from.depth, props.to.node.id, props.to.depth);
    return (React.createElement("path", { d: `M ${from_x} ${from_y} V ${from_y - mid_y}  H ${to_x} L ${to_x} ${to_y}`, stroke: props.selected ? "red" : "black", fill: "transparent" }));
};
exports.EdgeComponent = EdgeComponent;
//# sourceMappingURL=svg-dag-component.js.map