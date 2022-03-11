"use strict";
/**
 * @jest-environment jsdom
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const React = require("react");
const react_test_renderer_1 = require("react-test-renderer");
test("<DAGSVGComponent /> no nodes", () => {
    const component = (0, react_test_renderer_1.create)(React.createElement(index_1.DAGSVGComponent, { nodes: [] }));
});
test("<DAGSVGComponent /> one node", () => {
    const component = (0, react_test_renderer_1.create)(React.createElement(index_1.DAGSVGComponent, { nodes: [{ id: 1 }, { id: 2, parent: 1 }] }));
});
//# sourceMappingURL=index.test.js.map