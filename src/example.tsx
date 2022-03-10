import { DAGSVGComponent, DAGNode } from "./svg-dag-component";
import { render } from "react-dom";
import * as React from "react";

export const renderExample = () => {
  const nodes: DAGNode[] = [{ id: 0 }];

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
  render(
    <div style={{ height: "100%" }}>
      <pre style={{ height: "200px", overflow: "vertical" }}>{JSON.stringify(nodes, null, 2)}</pre>
      <DAGSVGComponent nodes={nodes} style={{ height: "100%", width: "100%" }} />
    </div>,
    document.getElementById("out")
  );
};

renderExample();
