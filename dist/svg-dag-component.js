"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeComponent = exports.NodeComponent = exports.DAGSVGComponent = exports.defaultConfiguration = void 0;
const React = require("react");
exports.defaultConfiguration = {
    width: 100,
    height: 50,
    horizontalGap: 25,
    verticalGap: 50,
};
const generateNodesAndEdges = (dagNodes, config) => {
    const r = calculateDepths(dagNodes);
    const nodes = [];
    const idToNode = {};
    for (let depth = r.depth; depth > -1; depth--) {
        const dagnodes = r.depthToNodes[depth] || [];
        let idx = 0;
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
const calculateDepths = (nodes) => {
    const idToNode = {};
    const idToParent = {};
    const idToDepth = {};
    const idToLeafCount = {};
    const idToDepthIndex = {};
    const depthToNodes = {};
    const parentToIds = {};
    const edges = [];
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
const DAGSVGComponent = (props) => {
    const svgRef = React.useRef();
    const renderNode = props.renderNode
        ? props.renderNode
        : (node) => React.createElement(exports.NodeComponent, { node: node, key: `${node.node.id}` });
    const renderEdge = props.renderEdge
        ? props.renderEdge
        : (edge) => React.createElement(exports.EdgeComponent, { from: edge.from, to: edge.to, key: `${edge.from.node.id}-${edge.to.node.id}` });
    React.useEffect(() => {
        if (svgRef.current) {
            if (props.onSVG) {
                props.onSVG(svgRef.current);
            }
            //const controller = svgPanZoom(svgRef.current);
            //controller.zoom(1);
        }
    }, [svgRef.current]);
    const dag = generateNodesAndEdges(props.nodes, props.configuration || exports.defaultConfiguration);
    return (React.createElement("svg", { version: "1.1", xmlns: "http://www.w3.org/2000/svg", ref: svgRef, style: props.style || {} },
        React.createElement("g", null,
            dag.nodes.map(renderNode),
            dag.edges.map(renderEdge))));
};
exports.DAGSVGComponent = DAGSVGComponent;
const NodeComponent = (props) => {
    return (React.createElement("g", null,
        React.createElement("rect", { width: props.node.width, height: props.node.height, x: props.node.x, y: props.node.y, fill: "white", stroke: "black" }),
        React.createElement("text", { x: props.node.x + 50, y: props.node.y + 25, fontSize: "10", textAnchor: "middle", fill: "black" }, props.node.node.title || props.node.node.id)));
};
exports.NodeComponent = NodeComponent;
const EdgeComponent = (props) => {
    const isAbove = props.from.y > props.to.y;
    const from_x = props.from.x + props.from.width / 2;
    const from_y = props.from.y + (isAbove ? 0 : props.from.height);
    const to_x = props.to.x + props.to.width / 2;
    const to_y = props.to.y + (isAbove ? props.to.height : 0);
    const mid_y = Math.abs(to_y - from_y) / 2 + props.from.index * 5;
    return (React.createElement("path", { d: `M ${from_x} ${from_y} V ${from_y - mid_y}  H ${to_x} L ${to_x} ${to_y}`, stroke: "black", fill: "transparent" }));
};
exports.EdgeComponent = EdgeComponent;
//# sourceMappingURL=svg-dag-component.js.map