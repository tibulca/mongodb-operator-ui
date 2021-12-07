import { ResourceWithActions } from "../../../core/models";

export type GraphNode = {
  resource: ResourceWithActions;

  x: number;
  y: number;
  weight: number;
  level: number;

  parent: GraphNode | undefined;
  children: GraphNode[];
  dependsOnNodes: GraphNode[];
  dependentNodes: GraphNode[];

  isGroup: boolean;
};

export type GraphNodes = Map<string, GraphNode>;
