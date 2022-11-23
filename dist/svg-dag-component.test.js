"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
const svg_dag_component_1 = require("./svg-dag-component");
const globals_1 = require("@jest/globals");
test("calculateDepths - no parents set", () => {
    const result = (0, svg_dag_component_1.calculateDepths)([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    (0, globals_1.expect)(result.edges.length).toBe(0);
    (0, globals_1.expect)(result.depth).toBe(1);
    (0, globals_1.expect)(result.depthToNodes[0].length).toBe(4);
});
test("calculateDepths - invalid parents", () => {
    const result = (0, svg_dag_component_1.calculateDepths)([{ id: 1, parents: [undefined, null, "not-valid"] }]);
    (0, globals_1.expect)(result.edges.length).toBe(0);
    (0, globals_1.expect)(result.depth).toBe(1);
    (0, globals_1.expect)(result.depthToNodes[0].length).toBe(1);
    (0, globals_1.expect)(Object.entries(result.depthToNodes).length).toBe(1);
});
test("calculateDepths - diamond", () => {
    const result = (0, svg_dag_component_1.calculateDepths)([
        { id: 1 },
        { id: 2, parents: [1] },
        { id: 3, parents: [1] },
        { id: 4, parents: [2, 3] },
    ]);
    (0, globals_1.expect)(result.edges.length).toBe(4);
    (0, globals_1.expect)(result.depth).toBe(3);
    (0, globals_1.expect)(result.depthToNodes[0].length).toBe(1);
    (0, globals_1.expect)(result.depthToNodes[1].length).toBe(2);
    (0, globals_1.expect)(result.depthToNodes[2].length).toBe(1);
});
test("calculateDepths - infinite loop", () => {
    const result = (0, svg_dag_component_1.calculateDepths)([
        { id: 1 },
        { id: 2, parents: [1, 2] },
    ]);
    (0, globals_1.expect)(result.edges.length).toBe(2);
    (0, globals_1.expect)(result.depth).toBe(2);
    (0, globals_1.expect)(result.depthToNodes[0].length).toBe(1);
    (0, globals_1.expect)(result.depthToNodes[1].length).toBe(1);
});
//# sourceMappingURL=svg-dag-component.test.js.map