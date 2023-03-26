import * as React from "react";
import * as dagre from "dagre";
export type NodeIdType = number;
export interface DAGNode {
    title?: string;
    id: NodeIdType;
    parents?: NodeIdType[];
    width?: number;
    height?: number;
}
export interface Configuration {
    /** Default node width */
    width?: number;
    /** Default node height */
    height?: number;
    horizontalGap?: number;
    verticalGap?: number;
    enablePanZoom?: boolean;
    edgePadding?: number;
    dagreOptions?: dagre.GraphLabel;
    panZoomOptions?: SvgPanZoom.Options;
    autoCenterSelectedNode?: boolean;
}
export declare const defaultConfiguration: Configuration;
interface GenerateNodesAndEdgesResult {
    nodes: Node[];
    edges: Edge[];
}
export declare const generateNodesAndEdges: (dagNodes: DAGNode[], config: Configuration) => GenerateNodesAndEdgesResult;
export type DAGEdge = {
    from: NodeIdType;
    to: NodeIdType;
};
export declare const DAGSVGComponent: React.ForwardRefExoticComponent<{
    nodes: DAGNode[];
    configuration?: Configuration;
    onSVG?(element: any): void;
    onPanZoomInit?(controller: SvgPanZoom.Instance): void;
    style?: React.CSSProperties;
    renderNode?(props: NodeComponentProps): JSX.Element;
    renderEdge?(edge: Edge, selected: boolean): JSX.Element;
    onClick?(node: Node): void;
    selectedNode?: NodeIdType;
} & React.RefAttributes<unknown>>;
export interface Edge {
    points: {
        x: number;
        y: number;
    }[];
    from: DAGNode;
    to: DAGNode;
}
export interface Node {
    x: number;
    y: number;
    width: number;
    height: number;
    node: DAGNode;
}
export interface NodeComponentProps {
    node: Node;
    key?: string;
    onClick?(node: Node): void;
    selected: boolean;
}
export declare const NodeComponent: React.MemoExoticComponent<(props: NodeComponentProps) => JSX.Element>;
export declare const EdgeComponent: React.MemoExoticComponent<(props: {
    points: {
        x: number;
        y: number;
    }[];
    key?: string;
    configuration: Configuration;
    selected: boolean;
}) => JSX.Element>;
export {};
