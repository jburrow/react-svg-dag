"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderExample = void 0;
const svg_dag_component_1 = require("./svg-dag-component");
const react_dom_1 = require("react-dom");
const React = require("react");
const renderExample = () => {
    const nodes = [{ id: 0 }];
    for (let d = 1; d < 3; d++) {
        const l1id = d;
        nodes.push({ id: l1id, parent: 0 });
        for (let i = 0; i < 3; i++) {
            const l2id = l1id * 10 + i;
            nodes.push({ id: l2id, parent: l1id });
            for (let y = 0; y < 3; y++) {
                const l3id = l2id * 10 + y;
                nodes.push({ id: l3id, parent: l2id });
            }
        }
    }
    (0, react_dom_1.render)(React.createElement("div", { style: { height: "100%" } },
        React.createElement("pre", { style: { height: "200px", overflow: "vertical" } }, JSON.stringify(nodes, null, 2)),
        React.createElement(svg_dag_component_1.DAGSVGComponent, { nodes: nodes, style: { height: "100%", width: "100%" } })), document.getElementById("out"));
};
exports.renderExample = renderExample;
(0, exports.renderExample)();
//# sourceMappingURL=example.js.map