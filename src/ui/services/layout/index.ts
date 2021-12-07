import { MongodbDeploymentWithActions } from "../../../core/models";
import { NetworkLayout, ResourceVisibility } from "../../ui-enums";
import { DisplaySettings, MongodbDeploymentUIModel, ResourceUIModel } from "../../ui-models";
import { setFixedLayout } from "./fixed";
import { GraphNode, GraphNodes } from "./models";
import clonedeep from "lodash.clonedeep";

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

const applyDisplaySettings = (settings: DisplaySettings, nodes: GraphNodes, groupedNodes: Map<string, GraphNode[]>) => {
  const hideNode = (n: GraphNode) => {
    if (n.parent) {
      n.parent.children = n.parent.children.filter((c) => c.resource.uid !== n.resource.uid);
    }

    n.children.forEach((c) => (c.parent = undefined));

    n.dependentNodes.forEach((dn) => dn.dependsOnNodes.filter((d) => d.resource.uid === n.resource.uid));

    nodes.delete(n.resource.uid);
  };

  nodes.forEach((n) => {
    const resDisplay = settings.ResourcesMap.get(n.resource.kind);
    if (resDisplay === ResourceVisibility.ShowGrouped) {
      const groupId = `GROUP: ${n.resource.kind}`;
      const group = groupedNodes.get(groupId) || [];
      group.push(clonedeep(n));
      groupedNodes.set(groupId, group);

      hideNode(n);
    } else if (
      resDisplay === ResourceVisibility.Hide ||
      (resDisplay === ResourceVisibility.ShowOnlyIfReferenced &&
        !n.parent &&
        !n.children.length &&
        !n.dependsOnNodes.length &&
        !n.dependentNodes.length)
    ) {
      hideNode(n);
    }
  });
};

const graphNodeToResourceUIModel = (n: GraphNode): ResourceUIModel => ({
  ...n.resource,
  ui: {
    location: {
      x: Math.round(n.ui.location.x),
      y: n.ui.location.y,
    },
    size: n.ui.size,
    font: n.ui.font,
  },
  isGroup: n.isGroup,
});

const insertGroupNodes = (nodes: GraphNodes, groupedNodes: Map<string, GraphNode[]>) => {
  Array.from(groupedNodes.entries()).forEach(([groupId, group]) => {
    const newNode: GraphNode = {
      resource: {
        uid: groupId,
        name: groupId,
        kind: group[0].resource.kind,
        creationTimestamp: Date.now(),
        fullStatus: undefined,
      },
      ui: {
        location: { x: 0, y: 0 },
      },
      weight: 0,
      level: 0,
      parent: undefined,
      children: [],
      dependsOnNodes: [],
      dependentNodes: [],
      isGroup: true,
    };

    newNode.children = group.reduce((acc, n) => {
      acc.push(...n.children);
      return acc;
    }, [] as GraphNode[]);

    newNode.dependsOnNodes = group.reduce((acc, n) => {
      acc.push(...n.dependsOnNodes.filter((don) => !acc.includes(don)));
      if (n.parent && !acc.includes(n.parent)) {
        acc.push(n.parent);
        n.parent.dependentNodes.push(newNode);
      }
      return acc;
    }, [] as GraphNode[]);
    newNode.resource.dependsOnUIDs = newNode.dependsOnNodes.map((don) => don.resource.uid);

    newNode.dependentNodes = group.reduce((acc, n) => {
      acc.push(...n.dependentNodes.filter((dn) => !acc.includes(dn)));
      // todo: update dependentNodes (dependsOnUIDs & dependentNodes)
      return acc;
    }, [] as GraphNode[]);

    nodes.set(groupId, newNode);
  });
};

export const generateLayout = (
  deployment: MongodbDeploymentWithActions,
  settings: DisplaySettings
): MongodbDeploymentUIModel => {
  let nodes: Map<string, GraphNode> = new Map(
    deployment.k8sResources.map((res) => [
      res.uid,
      {
        resource: res,
        ui: {
          location: { x: 0, y: 0 },
        },
        weight: 0,
        level: 0,
        parent: undefined,
        children: [],
        dependsOnNodes: [],
        dependentNodes: [],
        isGroup: false,
      },
    ])
  );
  const groupedNodes = new Map<string, GraphNode[]>();

  addNodesRelation(nodes);

  applyDisplaySettings(settings, nodes, groupedNodes);
  // todo: this can be fixed by making applyDisplaySettings recursive
  applyDisplaySettings(settings, nodes, groupedNodes);

  insertGroupNodes(nodes, groupedNodes);

  if (settings.Layout === NetworkLayout.Fixed) {
    nodes = setFixedLayout({ cluster: "", namespace: "citi" }, nodes);
  }

  return {
    resources: Array.from(nodes.values()).map(graphNodeToResourceUIModel),
    resourceGroups: new Map(
      Array.from(groupedNodes.entries()).map(([groupId, group]) => [groupId, group.map(graphNodeToResourceUIModel)])
    ),
  };
};
