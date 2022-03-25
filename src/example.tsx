import { DAGSVGComponent, DAGNode, Node, NodeComponentProps } from "./index";
import { render } from "react-dom";
import * as React from "react";
import { randomNodes, exampleDiamond } from "./example-nodes";

const ExampleApp = () => {
  const [nodes, setNodes] = React.useState<DAGNode[]>(randomNodes());
  const [selectedNode, setSelectedNode] = React.useState<Node>();

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "row" }}>
      <div style={{ lineHeight: "10px", fontSize: 10, fontFamily: "Consolas" }}>
        {nodes.map((node) => (
          <pre
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <button onClick={() => setNodes(randomNodes())}>Generate Random Nodes</button>
          <button onClick={() => setNodes(exampleDiamond)}>diamond</button>
        </div>
        <DAGSVGComponent
          nodes={nodes}
          style={{ height: "500px", width: "100%" }}
          onClick={setSelectedNode}
          selectedNode={selectedNode?.node.id}
        />
        <DAGSVGComponent
          onClick={setSelectedNode}
          selectedNode={selectedNode?.node.id}
          nodes={nodes}
          style={{ height: "1024px", width: "100%" }}
          renderNode={(x) => <NodeComponent {...x} />}
          onPanZoomInit={(c) => {
            console.log("[onPanZoomInit]", c);
          }}
          onSVG={(s) => {
            console.log("[onSVG]", s);
          }}
        />
      </div>
    </div>
  );
};

export const renderExample = () => {
  render(<ExampleApp />, document.getElementById("out"));
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
