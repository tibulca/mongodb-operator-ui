import { MongodbDeploymentWithActions } from "../../../core/models";
import { NetworkLayout, ResourceVisibility } from "../../ui-enums";
import { DisplaySettings, MongodbDeploymentUIModel } from "../../ui-models";
import { setFixedLayout } from "./fixed";
import { Graph, GraphNode } from "./models";

const addNodesRelation = (graph: Graph) =>
  graph.nodes.forEach((n) => {
    const ownerUid = n.res.ownerReference?.uid;
    if (ownerUid) {
      n.parent = graph.nodes.get(ownerUid);
      n.parent?.children.push(n);
    }
    n.res.dependsOnUIDs?.forEach((dn) => {
      const dependsOnNode = graph.nodes.get(dn) as GraphNode;
      n.dependsOnNodes.push(dependsOnNode);
      dependsOnNode.dependentNodes.push(n);
    });
  });

const applyDisplaySettings = (settings: DisplaySettings, graph: Graph) =>
  Array.from(graph.nodes.values()).forEach((n) => {
    const resDisplay = settings.ResourcesMap.get(n.res.kind);
    if (
      resDisplay === ResourceVisibility.Hide ||
      (resDisplay === ResourceVisibility.ShowOnlyIfReferenced &&
        !n.parent &&
        !n.children.length &&
        !n.dependsOnNodes.length &&
        !n.dependentNodes.length)
    ) {
      if (n.parent) {
        n.parent.children = n.parent.children.filter((c) => c.res.uid !== n.res.uid);
      }
      n.children.forEach((c) => {
        c.parent = undefined;
      });
      n.dependentNodes.forEach((dn) => dn.dependsOnNodes.filter((d) => d.res.uid === n.res.uid));
      graph.nodes.delete(n.res.uid);
    }
  });

export const generateLayout = (
  deployment: MongodbDeploymentWithActions,
  settings: DisplaySettings
): MongodbDeploymentUIModel => {
  let graph: Graph = {
    nodes: new Map(
      deployment.k8sResources.map((res) => [
        res.uid,
        {
          res,
          x: 0,
          y: 0,
          weight: 0,
          level: 0,
          parent: undefined,
          children: [],
          dependsOnNodes: [],
          dependentNodes: [],
        } as GraphNode,
      ])
    ),
    levelNodes: new Map(),
  };

  addNodesRelation(graph);

  applyDisplaySettings(settings, graph);
  // todo: this can be fixed by making applyDisplaySettings recursive
  applyDisplaySettings(settings, graph);

  if (settings.Layout === NetworkLayout.Fixed) {
    graph = setFixedLayout(graph);
  }

  return {
    k8sResources: Array.from(graph.nodes.values()).map((n) => ({
      ...n.res,
      ui: {
        location: {
          x: Math.round(n.x),
          y: n.y,
        },
      },
    })),
  };
};
