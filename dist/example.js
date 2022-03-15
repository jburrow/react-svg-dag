"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderExample = void 0;
const index_1 = require("./index");
const react_dom_1 = require("react-dom");
const React = require("react");
const example_nodes_1 = require("./example-nodes");
const renderExample = () => {
    const nodes = (0, example_nodes_1.randomNodes)();
    //const nodes = example001;
    (0, react_dom_1.render)(React.createElement("div", { style: { height: "100%", width: "100%", display: "flex", flexDirection: "row" } },
        React.createElement("pre", { style: { lineHeight: "10px", fontSize: 10, fontFamily: "Consolas" } }, JSON.stringify(nodes, null, 2)),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100%", width: "100%" } },
            React.createElement(index_1.DAGSVGComponent, { nodes: nodes, style: { height: "500px", width: "100%" } }),
            React.createElement(index_1.DAGSVGComponent, { nodes: nodes, style: { height: "1024px", width: "100%" }, renderNode: (node) => React.createElement(NodeComponent, { node: node, key: `${node.node.id}` }), onPanZoomInit: (c) => {
                    console.log("[onPanZoomInit]", c);
                }, onSVG: (s) => {
                    console.log("[onSVG]", s);
                } }))), document.getElementById("out"));
};
exports.renderExample = renderExample;
const NodeComponent = (props) => {
    const colors = ["red", "orange", "green", "cyan", "pick", "silver", "gold"];
    return (React.createElement("g", null,
        React.createElement("rect", { width: props.node.width, height: props.node.height, x: props.node.x, y: props.node.y, rx: 5, fill: colors[props.node.depth] || "white", stroke: "black" }),
        React.createElement("text", { x: props.node.x + props.node.width / 2, y: props.node.y + props.node.height / 2, fontSize: "10", textAnchor: "middle", fill: "black" }, props.node.node.title || props.node.node.id)));
};
(0, exports.renderExample)();
//# sourceMappingURL=example.js.map