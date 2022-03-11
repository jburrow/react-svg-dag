import * as React from "react";
export declare type IdType = number | string;
export interface DAGNode {
    title?: string;
    id: IdType;
    parent?: IdType;
}
export interface Configuration {
    width: number;
    height: number;
    horizontalGap: number;
    verticalGap: number;
}
export declare const defaultConfiguration: Configuration;
export declare const DAGSVGComponent: (props: {
    nodes: DAGNode[];
    configuration?: Configuration;
    onSVG?(element: any): void;
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
    key?: IdType;
}) => JSX.Element;
export declare const EdgeComponent: (props: {
    from: Node;
    to: Node;
    key?: string;
}) => JSX.Element;
