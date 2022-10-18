"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderExample = void 0;
const index_1 = require("./index");
const client_1 = require("react-dom/client");
const React = require("react");
const example_nodes_1 = require("./example-nodes");
const ExampleApp = () => {
    const [nodes, setNodes] = React.useState(example_nodes_1.exampleDiamond);
    const [selectedNode, setSelectedNode] = React.useState();
    return (React.createElement("div", { style: { height: "100%", width: "100%", display: "flex", flexDirection: "row" } },
        React.createElement("div", { style: { lineHeight: "10px", fontSize: 10, fontFamily: "Consolas" } }, nodes.map((node, idx) => {
            var _a, _b, _c;
            return (React.createElement("pre", { key: idx, style: {
                    color: node.id === ((_a = selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.node) === null || _a === void 0 ? void 0 : _a.id)
                        ? "red"
                        : ((_b = node.parents) === null || _b === void 0 ? void 0 : _b.indexOf((_c = selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.node) === null || _c === void 0 ? void 0 : _c.id)) > -1
                            ? "pink"
                            : "grey",
                } }, JSON.stringify(node, null, 2)));
        })),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100%", width: "100%" } },
            React.createElement("div", { style: { display: "flex", flexDirection: "row" } },
                React.createElement("button", { onClick: () => setNodes((0, example_nodes_1.randomNodes)()) }, "Generate Random Nodes"),
                React.createElement("button", { onClick: () => setNodes(example_nodes_1.exampleDiamond) }, "diamond")),
            React.createElement("h4", null, "defaults"),
            React.createElement(index_1.DAGSVGComponent, { nodes: nodes, style: { height: "500px", width: "100%" }, onClick: setSelectedNode, selectedNode: selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.node.id }),
            React.createElement("h3", null, "With Config"),
            React.createElement(index_1.DAGSVGComponent, { onClick: setSelectedNode, selectedNode: selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.node.id, nodes: nodes, style: { height: "1024px", width: "100%" }, renderNode: (x) => React.createElement(NodeComponent, Object.assign({}, x)), configuration: {
                    enablePanZoom: true,
                    edgePadding: 10,
                    height: 40,
                    horizontalGap: 10,
                    verticalGap: 10,
                    width: 40,
                    autoCenterSelectedNode: true,
                    panZoomOptions: {},
                }, onPanZoomInit: (c) => {
                    console.log("[onPanZoomInit]", c);
                }, onSVG: (s) => {
                    console.log("[onSVG]", s);
                } }))));
};
const renderExample = () => {
    const root = (0, client_1.createRoot)(document.getElementById("out"));
    root.render(React.createElement(ExampleApp, null));
};
exports.renderExample = renderExample;
const NodeComponent = (props) => {
    const colors = ["red", "purple", "green", "cyan", "pink", "silver", "gold"];
    return (React.createElement("g", { onClick: () => props.onClick(props.node) },
        React.createElement("rect", { width: props.node.width, height: props.node.height, x: props.node.x, y: props.node.y, rx: 5, fill: props.selected ? "orange" : colors[props.node.depth] || "white", stroke: "black" }),
        React.createElement("text", { x: props.node.x + props.node.width / 2, y: props.node.y + props.node.height / 2, fontSize: "10", textAnchor: "middle", fill: "black" }, props.node.node.title || props.node.node.id)));
};
(0, exports.renderExample)();
//# sourceMappingURL=example.js.map