/**
 * @jest-environment jsdom
 */

import { DAGSVGComponent } from "./index";

import * as React from "react";

import { create } from "react-test-renderer";
import { expect } from "@jest/globals";

test("<DAGSVGComponent /> no nodes", () => {
  const component = create(<DAGSVGComponent nodes={[]} />);
  const testInstance = component.root;

  expect(testInstance.findByType(DAGSVGComponent).props.nodes).toEqual([]);
});
test("<DAGSVGComponent /> three node", () => {
  const component = create(<DAGSVGComponent nodes={[{ id: 1 }, { id: 2 }, { id: 3, parents: [1, 2] }]} />);
});
