import * as React from "react";
export declare type IdType = number;
export interface DAGNode {
    title?: string;
    id: IdType;
    parents?: IdType[];
}
export interface Configuration {
    width: number;
    height: number;
    horizontalGap: number;
    verticalGap: number;
    enablePanZoom: boolean;
    edgePadding: number;
    panZoomOptions?: SvgPanZoom.Options;
}
export declare const defaultConfiguration: Configuration;
export declare const DAGSVGComponent: (props: {
    nodes: DAGNode[];
    configuration?: Configuration;
    onSVG?(element: any): void;
    onPanZoomInit?(controller: SvgPanZoom.Instance): void;
    style?: React.CSSProperties;
    renderNode?(node: Node): JSX.Element;
    renderEdge?(edge: Edge): JSX.Element;
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
export declare const NodeComponent: (props: {
    node: Node;
    key?: string;
    onClick?(node: Node): void;
}) => JSX.Element;
export declare const EdgeComponent: (props: {
    from: Node;
    to: Node;
    key?: string;
    configuration: Configuration;
}) => JSX.Element;
