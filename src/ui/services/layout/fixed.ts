import { K8SKind, MongoDBKind } from "../../../core/enums";
import { balanceSortedArray, groupBy, isOperatorPod } from "../../../core/utils";
import { GraphNode, GraphNodes } from "./models";

type Graph = {
  nodes: GraphNodes;
  levelNodes: Map<number, GraphNode[]>;
};

const OperatorSortWeight = 10000;

const LevelAdjustment = new Map<K8SKind | MongoDBKind, number>([
  [K8SKind.Secret, 5],
  [K8SKind.ConfigMap, 5],
  [K8SKind.PersistentVolumeClaim, 5],
  [K8SKind.PersistentVolume, 6],
]);

const updateNodeLevelRec = (n: GraphNode) => {
  n.level = n.parent ? n.parent.level + 1 : LevelAdjustment.get(n.resource.kind) ?? 0;
  n.children.forEach((cn) => updateNodeLevelRec(cn));
};

const updateNodeWeightRec = (n: GraphNode) => {
  const childrenByLevel = groupBy(n.children, (c: GraphNode) => String(c.level));

  n.weight = Math.max(
    isOperatorPod(n.resource) ? OperatorSortWeight + 1 : 1,
    ...Array.from(childrenByLevel.values()).map((childrenGroup) =>
      childrenGroup.map(updateNodeWeightRec).reduce((acc, w) => acc + w, 0)
    )
  );

  return n.weight;
};

const adjustNodeLevelRec = (n: GraphNode, parentOrDepLevel: number) => {
  n.level = Math.max(parentOrDepLevel + 1, n.level);
  n.children.forEach((cn) => adjustNodeLevelRec(cn, n.level));
};

const updateLevelsAndWeight = (g: Graph) => {
  const nodes = Array.from(g.nodes.values());
  const parentNodes = nodes.filter((n) => !n.parent);
  parentNodes.forEach(updateNodeLevelRec);

  nodes
    .filter((n) => n.dependsOnNodes.length)
    .forEach((n) => adjustNodeLevelRec(n, Math.max(...n.dependsOnNodes.map((dn) => dn.level))));

  parentNodes.forEach(updateNodeWeightRec);

  nodes.forEach((n) => g.levelNodes.set(n.level, [...(g.levelNodes.get(n.level) ?? []), n]));
};

const updateCoordinates = (
  g: Graph,
  n: GraphNode,
  xCoordByLevel: number[],
  padding: { x: number; y: number },
  parentOffsetX: number
) => {
  n.ui.location.y = n.level * padding.y;
  const nodeWeight = n.weight >= OperatorSortWeight ? n.weight - OperatorSortWeight + 1 : n.weight;

  const xStart = Math.max(xCoordByLevel[n.level] ?? 0, parentOffsetX);
  const xEnd = xStart + nodeWeight * padding.x;
  n.ui.location.x = xStart + (xEnd - xStart) / 2;
  xCoordByLevel[n.level] = xEnd;

  n.children.forEach((cn) => updateCoordinates(g, cn, xCoordByLevel, padding, xStart));
};

const getPadding = (graph: Graph) => {
  const paddingY = 150;
  const maxNodesPerLevel = Math.max(...Array.from(graph.levelNodes.values()).map((ln) => ln.length));
  return {
    x: Math.max(paddingY * (graph.levelNodes.size / maxNodesPerLevel) * 1.1, 140),
    y: paddingY,
  };
};

const addNamespaceNode = (cluster: string, namespace: string, graph: Graph) => {
  const nodeId = `ns-${cluster}-${namespace}`;
  const nodes = Array.from(graph.nodes.values());
  const height = Math.max(...nodes.map((n) => n.ui.location.y)) + 200;
  const width = Math.max(...nodes.map((n) => n.ui.location.x)) + 75;
  graph.nodes.set(nodeId, {
    resource: {
      uid: nodeId,
      name: cluster !== "inClusterContext" ? `${cluster}: ${namespace}` : namespace,
      namespace,
      kind: K8SKind.Namespace,
      creationTimestamp: Date.now(),
      fullStatus: undefined,
      docs: { labels: [] },
    },
    ui: {
      location: { x: width / 2 + 20, y: height / 2 - 70 },
      size: { height, width },
      font: { size: 32, bold: true },
    },
    weight: 0,
    level: 0,
    parent: undefined,
    children: [],
    dependsOnNodes: [],
    dependentNodes: [],
    isGroup: false,
  });
};

export const setFixedLayout = (cluster: string, namespace: string, nodes: GraphNodes): GraphNodes => {
  let graph: Graph = {
    nodes,
    levelNodes: new Map(),
  };

  updateLevelsAndWeight(graph);

  graph.levelNodes.set(0, balanceSortedArray((graph.levelNodes.get(0) ?? []).sort((n1, n2) => n1.weight - n2.weight)));

  const padding = getPadding(graph);

  const xCoordByLevel: number[] = [];
  graph.levelNodes.forEach((levelNodes) => {
    const levelNodesWithoutParent = levelNodes.filter((n) => !n.parent);
    levelNodesWithoutParent.forEach((n) => updateCoordinates(graph, n, xCoordByLevel, padding, 0));
  });

  addNamespaceNode(cluster, namespace, graph);

  return graph.nodes;
};
