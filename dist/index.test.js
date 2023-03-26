"use strict";
/**
 * @jest-environment jsdom
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const React = require("react");
const react_test_renderer_1 = require("react-test-renderer");
const globals_1 = require("@jest/globals");
test("<DAGSVGComponent /> no nodes", () => {
    const component = (0, react_test_renderer_1.create)(React.createElement(index_1.DAGSVGComponent, { nodes: [] }));
    const testInstance = component.root;
    (0, globals_1.expect)(testInstance.findByType(index_1.DAGSVGComponent).props.nodes).toEqual([]);
});
test("<DAGSVGComponent /> three node", () => {
    const component = (0, react_test_renderer_1.create)(React.createElement(index_1.DAGSVGComponent, { nodes: [{ id: 1 }, { id: 2 }, { id: 3, parents: [1, 2] }] }));
});
//# sourceMappingURL=index.test.js.map