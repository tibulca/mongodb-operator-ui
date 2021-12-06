import { K8SResourceWithActions } from "../../../core/models";

export type GraphNode = {
  resource: K8SResourceWithActions;

  x: number;
  y: number;
  weight: number;
  level: number;

  parent: GraphNode | undefined;
  children: GraphNode[];
  dependsOnNodes: GraphNode[];
  dependentNodes: GraphNode[];
};

export type GraphNodes = Map<string, GraphNode>;
