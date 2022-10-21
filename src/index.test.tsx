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
test("<DAGSVGComponent /> one node", () => {
  const component = create(<DAGSVGComponent nodes={[{ id: 1 }, { id: 2 }, { id: 3, parents: [1, 2] }]} />);
});
test("<DAGSVGComponent /> bad parents", () => {
  const component = create(
    <DAGSVGComponent nodes={[{ id: 1 }, { id: 2 }, { id: 3, parents: [null, undefined, 9999] }]} />
  );
});

test("<DAGSVGComponent /> bad renders", () => {
  const component = create(
    <DAGSVGComponent
      renderNode={() => {
        throw "raised from unit-test";
        return <div />;
      }}
      renderEdge={() => {
        throw "raised from unit-test";
        return <div />;
      }}
      nodes={[{ id: 1 }, { id: 2 }, { id: 3, parents: [null, undefined, 9999] }]}
    />
  );
});
