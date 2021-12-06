import { K8SResourceWithActions } from "../../../core/models";

export type GraphNode = {
  res: K8SResourceWithActions;

  x: number;
  y: number;
  weight: number;
  level: number;

  parent: GraphNode | undefined;
  children: GraphNode[];
  dependsOnNodes: GraphNode[];
  dependentNodes: GraphNode[];
};

export type Graph = {
  nodes: Map<string, GraphNode>;
  levelNodes: Map<number, GraphNode[]>;
};
