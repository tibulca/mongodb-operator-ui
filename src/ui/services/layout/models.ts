import { ResourceWithActionsAndDocs } from "../../../core/models";

export type GraphNode = {
  resource: ResourceWithActionsAndDocs;

  ui: {
    location: {
      x: number;
      y: number;
    };
    size?: {
      height: number;
      width: number;
    };
    font?: {
      size: number;
      bold: boolean;
    };
  };

  weight: number;
  level: number;

  parent: GraphNode | undefined;
  children: GraphNode[];
  dependsOnNodes: GraphNode[];
  dependentNodes: GraphNode[];

  isGroup: boolean;
};

export type GraphNodes = Map<string, GraphNode>;
