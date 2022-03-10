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
}) => any;
