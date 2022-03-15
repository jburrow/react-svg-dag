import { DAGSVGComponent, DAGNode, Node } from "./index";
import { render } from "react-dom";
import * as React from "react";
import { randomNodes } from "./example-nodes";

export const renderExample = () => {
  const nodes = randomNodes();
  //const nodes = example001;
  render(
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "row" }}>
      <pre style={{ lineHeight: "10px", fontSize: 10, fontFamily: "Consolas" }}>{JSON.stringify(nodes, null, 2)}</pre>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <DAGSVGComponent nodes={nodes} style={{ height: "500px", width: "100%" }} />
        <DAGSVGComponent
          nodes={nodes}
          style={{ height: "1024px", width: "100%" }}
          renderNode={(node: Node) => <NodeComponent node={node} key={`${node.node.id}`} />}
          onPanZoomInit={(c) => {
            console.log("[onPanZoomInit]", c);
          }}
          onSVG={(s) => {
            console.log("[onSVG]", s);
          }}
        />
      </div>
    </div>,
    document.getElementById("out")
  );
};

const NodeComponent = (props: { node: Node; key: string }) => {
  const colors = ["red", "orange", "green", "cyan", "pick", "silver", "gold"];

  return (
    <g>
      <rect
        width={props.node.width}
        height={props.node.height}
        x={props.node.x}
        y={props.node.y}
        rx={5}
        fill={colors[props.node.depth] || "white"}
        stroke="black"
      />
      <text
        x={props.node.x + props.node.width / 2}
        y={props.node.y + props.node.height / 2}
        fontSize="10"
        textAnchor="middle"
        fill="black"
      >
        {props.node.node.title || props.node.node.id}
      </text>
    </g>
  );
};

renderExample();
