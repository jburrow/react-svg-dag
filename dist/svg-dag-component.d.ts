import * as React from "react";
export declare type IdType = number;
export interface DAGNode {
    title?: string;
    id: IdType;
    parents?: IdType[];
}
export interface Configuration {
    width?: number;
    height?: number;
    horizontalGap?: number;
    verticalGap?: number;
    enablePanZoom?: boolean;
    edgePadding?: number;
    panZoomOptions?: SvgPanZoom.Options;
    autoCenterSelectedNode?: boolean;
    autoSelectNode?: boolean;
}
export declare const defaultConfiguration: Configuration;
interface GenerateNodesAndEdgesResult {
    nodes: Node[];
    edges: Edge[];
    selectedNode?: number;
}
export declare const generateNodesAndEdges: (dagNodes: DAGNode[], config: Configuration) => GenerateNodesAndEdgesResult;
export declare const calculateDepths: (nodes: DAGNode[]) => {
    parentToIds: Record<number, number[]>;
    maxNumberOfNodesInRow: number;
    idToNode: Record<number, DAGNode>;
    idToDepth: Record<number, number>;
    edges: [DAGNode, DAGNode][];
    idToDepthIndex: Record<number, number>;
    idToParentIds: Record<number, number[]>;
    depthToNodes: Record<number, DAGNode[]>;
    depth: number;
    idToLeafCount: Record<number, number>;
};
export declare type DAGEdge = {
    from: IdType;
    to: IdType;
};
export declare const DAGSVGComponent: (props: {
    nodes: DAGNode[];
    configuration?: Configuration;
    onSVG?(element: any): void;
    onPanZoomInit?(controller: SvgPanZoom.Instance): void;
    style?: React.CSSProperties;
    renderNode?(props: NodeComponentProps): JSX.Element;
    renderEdge?(edge: Edge, selected: boolean): JSX.Element;
    onClick?(node: Node): void;
    selectedNode?: IdType;
}) => JSX.Element;
export interface Edge {
    to: Node;
    from: Node;
}
export interface Node {
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    index: number;
    node: DAGNode;
}
export interface NodeComponentProps {
    node: Node;
    key?: string;
    onClick?(node: Node): void;
    selected: boolean;
}
export declare const NodeComponent: (props: NodeComponentProps) => JSX.Element;
export declare const EdgeComponent: (props: {
    from: Node;
    to: Node;
    key?: string;
    configuration: Configuration;
    selected: boolean;
}) => JSX.Element;
export {};
