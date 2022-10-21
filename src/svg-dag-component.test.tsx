/**
 * @jest-environment jsdom
 */
import { calculateDepths } from "./svg-dag-component";

import * as React from "react";

import { create } from "react-test-renderer";
import { expect } from "@jest/globals";

test("calculateDepths - no parents set", () => {
  const result = calculateDepths([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);

  expect(result.edges.length).toBe(0);
  expect(result.depth).toBe(1);
  expect(result.depthToNodes[0].length).toBe(4);
});

test("calculateDepths - invalid parents", () => {
  const result = calculateDepths([{ id: 1, parents: [undefined, null, "not-valid" as unknown as number] }]);

  expect(result.edges.length).toBe(0);
  expect(result.depth).toBe(1);
  expect(result.depthToNodes[0].length).toBe(1);
  expect(Object.entries(result.depthToNodes).length).toBe(1);
});

test("calculateDepths - diamond", () => {
  const result = calculateDepths([
    { id: 1 },
    { id: 2, parents: [1] },
    { id: 3, parents: [1] },
    { id: 4, parents: [2, 3] },
  ]);

  expect(result.edges.length).toBe(4);
  expect(result.depth).toBe(3);
  expect(result.depthToNodes[0].length).toBe(1);
  expect(result.depthToNodes[1].length).toBe(2);
  expect(result.depthToNodes[2].length).toBe(1);
});
