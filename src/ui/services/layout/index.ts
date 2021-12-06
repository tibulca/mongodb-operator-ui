import { MongodbDeploymentWithActions } from "../../../core/models";
import { NetworkLayout, ResourceVisibility } from "../../ui-enums";
import { DisplaySettings, MongodbDeploymentUIModel } from "../../ui-models";
import { setFixedLayout } from "./fixed";
import { GraphNode, GraphNodes } from "./models";

const addNodesRelation = (nodes: GraphNodes) =>
  nodes.forEach((n) => {
    const ownerUid = n.resource.ownerReference?.uid;
    if (ownerUid) {
      n.parent = nodes.get(ownerUid);
      n.parent?.children.push(n);
    }
    n.resource.dependsOnUIDs?.forEach((dn) => {
      const dependsOnNode = nodes.get(dn) as GraphNode;
      n.dependsOnNodes.push(dependsOnNode);
      dependsOnNode.dependentNodes.push(n);
    });
  });

const applyDisplaySettings = (settings: DisplaySettings, nodes: GraphNodes) =>
  nodes.forEach((n) => {
    const resDisplay = settings.ResourcesMap.get(n.resource.kind);
    if (
      resDisplay === ResourceVisibility.Hide ||
      (resDisplay === ResourceVisibility.ShowOnlyIfReferenced &&
        !n.parent &&
        !n.children.length &&
        !n.dependsOnNodes.length &&
        !n.dependentNodes.length)
    ) {
      if (n.parent) {
        n.parent.children = n.parent.children.filter((c) => c.resource.uid !== n.resource.uid);
      }
      n.children.forEach((c) => {
        c.parent = undefined;
      });
      n.dependentNodes.forEach((dn) => dn.dependsOnNodes.filter((d) => d.resource.uid === n.resource.uid));
      nodes.delete(n.resource.uid);
    }
  });

export const generateLayout = (
  deployment: MongodbDeploymentWithActions,
  settings: DisplaySettings
): MongodbDeploymentUIModel => {
  let nodes = new Map(
    deployment.k8sResources.map((res) => [
      res.uid,
      {
        resource: res,
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
  );

  addNodesRelation(nodes);

  applyDisplaySettings(settings, nodes);
  // todo: this can be fixed by making applyDisplaySettings recursive
  applyDisplaySettings(settings, nodes);

  if (settings.Layout === NetworkLayout.Fixed) {
    nodes = setFixedLayout(nodes);
  }

  return {
    k8sResources: Array.from(nodes.values()).map((n) => ({
      ...n.resource,
      ui: {
        location: {
          x: Math.round(n.x),
          y: n.y,
        },
      },
    })),
  };
};
