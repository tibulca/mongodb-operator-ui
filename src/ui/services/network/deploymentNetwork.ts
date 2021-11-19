import { K8SKind, MongoDBKind } from "../../../core/enums";
import { K8SResourceWithActions, MongodbDeploymentUIModel, MongodbDeploymentWithActions } from "../../../core/models";
import { balanceSortedArray, groupBy, isOperatorPod } from "../../../core/utils";
import { DisplaySettings, ResourceDisplay } from "../../models/settings";

const OperatorSortWeight = 10000;

type Node = {
  res: K8SResourceWithActions;

  x: number;
  y: number;
  weight: number;
  level: number;

  parent: Node | undefined;
  children: Node[];
  dependsOnNodes: Node[];
  dependentNodes: Node[];
};

type Graph = {
  nodes: Map<string, Node>;
  levelNodes: Map<number, Node[]>;
};

const LevelAdjustment = new Map<K8SKind | MongoDBKind, number>([
  // [K8SKind.Deployment, 2],
  // [K8SKind.StatefulSet, 2],
  [K8SKind.Secret, 5],
  [K8SKind.ConfigMap, 5],
  [K8SKind.PersistentVolumeClaim, 5],
]);

const updateNodeLevelRec = (n: Node) => {
  n.level = n.parent ? n.parent.level + 1 : LevelAdjustment.get(n.res.kind) ?? 0;
  n.children.forEach((cn) => updateNodeLevelRec(cn));
};

const updateNodeWeightRec = (n: Node) => {
  // n.w = 1 + n.children.reduce((acc, cn) => acc + updateNodeWeightRec(cn), 0) + (isOperatorPod(n.res) ? 100 : 0);

  const childrenByLevel = groupBy(n.children, (c: Node) => String(c.level));

  n.weight = Math.max(
    isOperatorPod(n.res) ? OperatorSortWeight + 1 : 1,
    ...Array.from(childrenByLevel.values()).map((childrenGroup) => {
      const w = childrenGroup.map(updateNodeWeightRec).reduce((acc, w) => acc + w, 0);
      if (w > 9 && w < 100 && n.parent) {
        console.log(w, n);
      }
      return w;
    })
  );

  return n.weight;
};

const adjustNodeLevelRec = (n: Node, parentOrDepLevel: number) => {
  n.level = Math.max(parentOrDepLevel + 1, n.level);
  n.children.forEach((cn) => adjustNodeLevelRec(cn, n.level));
};

const updateLevelsAndWeight = (g: Graph) => {
  const nodes = Array.from(g.nodes.values());
  const parentNodes = nodes.filter((n) => !n.parent);
  parentNodes.forEach(updateNodeLevelRec);

  nodes
    // .filter((n) => n.dependsOnNodes.length && n.res.kind !== K8SKind.Service)
    .filter((n) => n.dependsOnNodes.length)
    .forEach((n) => adjustNodeLevelRec(n, Math.max(...n.dependsOnNodes.map((dn) => dn.level))));

  parentNodes.forEach(updateNodeWeightRec);

  nodes.forEach((n) => g.levelNodes.set(n.level, [...(g.levelNodes.get(n.level) ?? []), n]));
};

const updateCoordinates = (
  g: Graph,
  n: Node,
  xCoordByLevel: number[],
  padding: { x: number; y: number },
  parentOffsetX: number
) => {
  n.y = n.level * padding.y;
  const nodeWeight = n.weight >= OperatorSortWeight ? n.weight - OperatorSortWeight + 1 : n.weight;

  const xStart = Math.max(xCoordByLevel[n.level] ?? 0, parentOffsetX);
  const xEnd = xStart + nodeWeight * padding.x;
  n.x = xStart + (xEnd - xStart) / 2;
  xCoordByLevel[n.level] = xEnd;

  n.children.forEach((cn) => updateCoordinates(g, cn, xCoordByLevel, padding, xStart));
};

const getPadding = (graph: Graph) => {
  const paddingY = 150;
  const maxNodesPerLevel = Math.max(...Array.from(graph.levelNodes.values()).map((ln) => ln.length));
  return {
    x: Math.max(paddingY * (graph.levelNodes.size / maxNodesPerLevel) * 2, 140),
    y: paddingY,
  };
};

export const getMongodbDeploymentNetwork = (
  deployment: MongodbDeploymentWithActions,
  settings: DisplaySettings
): MongodbDeploymentUIModel => {
  const graph: Graph = {
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
        } as Node,
      ])
    ),
    levelNodes: new Map(),
  };

  // set relations with other nodes
  graph.nodes.forEach((n) => {
    const ownerUid = n.res.ownerReference?.uid;
    if (ownerUid) {
      n.parent = graph.nodes.get(ownerUid);
      n.parent?.children.push(n);
    }
    n.res.dependsOnUIDs?.forEach((dn) => {
      const dependsOnNode = graph.nodes.get(dn) as Node;
      n.dependsOnNodes.push(dependsOnNode);
      dependsOnNode.dependentNodes.push(n);
    });
  });

  Array.from(graph.nodes.values()).forEach((n) => {
    const resDisplay = settings.ResourcesMap.get(n.res.kind);
    if (
      resDisplay === ResourceDisplay.Hide ||
      (resDisplay === ResourceDisplay.ShowOnlyIfReferenced &&
        !n.parent &&
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

  updateLevelsAndWeight(graph);

  graph.levelNodes.set(0, balanceSortedArray((graph.levelNodes.get(0) ?? []).sort((n1, n2) => n1.weight - n2.weight)));

  const padding = getPadding(graph);
  //console.log(graph.levelNodes.size, maxNodesPerLevel, padding);

  const xCoordByLevel: number[] = [];
  graph.levelNodes.forEach((levelNodes) => {
    const levelNodesWithoutParent = levelNodes.filter((n) => !n.parent);
    levelNodesWithoutParent.forEach((n) => updateCoordinates(graph, n, xCoordByLevel, padding, 0));
  });

  return {
    k8sResources: Array.from(graph.nodes.values()).map((n) => ({
      ...n.res,
      //name: `l${n.level}, w${n.weight}, {${n.x},${n.y}}`,
      ui: {
        location: {
          x: Math.round(n.x),
          y: n.y,
        },
      },
    })),
  };
};
