/**
 * @jest-environment jsdom
 */

import { DAGSVGComponent } from "./index";

import * as React from "react";

import { create } from "react-test-renderer";

test("<DAGSVGComponent /> no nodes", () => {
  const component = create(<DAGSVGComponent nodes={[]} />);
});
test("<DAGSVGComponent /> one node", () => {
  const component = create(<DAGSVGComponent nodes={[{ id: 1 }, { id: 2 }, { id: 3, parents: [1, 2] }]} />);
});
