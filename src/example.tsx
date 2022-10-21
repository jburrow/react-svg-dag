import { DAGSVGComponent, DAGNode, Node, NodeComponentProps } from "./index";
import { createRoot } from "react-dom/client";
import * as React from "react";
import { randomNodes, exampleDiamond } from "./example-nodes";

const ExampleApp = () => {
  const [nodes, setNodes] = React.useState<DAGNode[]>(exampleDiamond);
  const [selectedNode, setSelectedNode] = React.useState<Node>();

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "row" }}>
      <div style={{ lineHeight: "10px", fontSize: 10, fontFamily: "Consolas", width: 200 }}>
        {nodes.map((node, idx) => (
          <pre
            key={idx}
            style={{
              color:
                node.id === selectedNode?.node?.id
                  ? "red"
                  : node.parents?.indexOf(selectedNode?.node?.id) > -1
                  ? "pink"
                  : "grey",
            }}
          >
            {JSON.stringify(node, null, 2)}
          </pre>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "row", height: "100%", width: "calc(100% - 200px)", gap: 5 }}>
        <div>
          <h3>defaults</h3>
          <DAGSVGComponent
            nodes={nodes}
            style={{ height: "500px", width: "500px", border: "1px solid black" }}
            onClick={setSelectedNode}
            selectedNode={selectedNode?.node.id}
          />
        </div>
        <div>
          <h3>With Config</h3>
          <DAGSVGComponent
            onClick={setSelectedNode}
            selectedNode={selectedNode?.node.id}
            nodes={nodes}
            style={{ height: "500px", width: "500px", border: "1px solid black" }}
            renderNode={(x) => <NodeComponent {...x} />}
            configuration={{
              edgePadding: 10,
              height: 40,
              horizontalGap: 10,
              verticalGap: 10,
              width: 40,
            }}
            onPanZoomInit={(c) => {
              console.log("[onPanZoomInit]", c);
            }}
            onSVG={(s) => {
              console.log("[onSVG]", s);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const renderExample = () => {
  const root = createRoot(document.getElementById("out"));
  root.render(<ExampleApp />);
};

const NodeComponent = (props: NodeComponentProps) => {
  const colors = ["red", "purple", "green", "cyan", "pink", "silver", "gold"];

  return (
    <g onClick={() => props.onClick(props.node)}>
      <rect
        width={props.node.width}
        height={props.node.height}
        x={props.node.x}
        y={props.node.y}
        rx={5}
        fill={props.selected ? "orange" : colors[props.node.depth] || "white"}
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
