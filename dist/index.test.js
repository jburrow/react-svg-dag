"use strict";
/**
 * @jest-environment jsdom
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const React = require("react");
const react_test_renderer_1 = require("react-test-renderer");
test("<DAGSVGComponent />", () => {
    const component = (0, react_test_renderer_1.create)(React.createElement(index_1.DAGSVGComponent, { nodes: [] }));
    expect(1).toBe(1);
});
//# sourceMappingURL=index.test.js.map