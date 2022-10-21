import * as React from "react";

import { DAGSVGComponent } from "../../src/svg-dag-component";

describe("DAGSVGComponent.cy.tsx", () => {
  it("no nodes", () => {
    cy.mount(<DAGSVGComponent nodes={[]} />);
  });

  it("one node", () => {
    cy.mount(<DAGSVGComponent nodes={[{ id: 1 }]} />);
  });

  it("two node", () => {
    cy.mount(<DAGSVGComponent nodes={[{ id: 1 }, { id: 2, parents: [1] }]} />);
  });

  it("one node - bad parent", () => {
    cy.mount(<DAGSVGComponent nodes={[{ id: 1, parents: [null, undefined, 9999] }]} />);
  });
});
