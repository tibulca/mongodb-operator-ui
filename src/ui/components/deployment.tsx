import React, { useState } from "react";
import YAML from "yaml";

import { K8SResource, MongodbDeployment, MongodbDeploymentUIModel } from "../../core/models";
import NodeInfoModal from "./node-info-modal";
import NodeClusterModal from "./node-cluster-modal";
import Network from "./network";
import * as NetworkModels from "../models/network";
import { K8SKind } from "../../core/enums";
import { DisplaySettings } from "../models/settings";

type DeploymentProps = {
  data: MongodbDeploymentUIModel;
  settings: DisplaySettings;
};

const ResourceImageMap: Record<string, string> = {
  ["operator"]: "/images/pod-256.png",
  [K8SKind.Pod.toLowerCase()]: "/images/pod-256.png",
  [K8SKind.CustomResourceDefinition.toLowerCase()]: "/images/crd-256.png",
  [K8SKind.Deployment.toLowerCase()]: "/images/deploy-256.png",
  [K8SKind.StatefulSet.toLowerCase()]: "/images/sts-256.png",
  [K8SKind.ReplicaSet.toLowerCase()]: "/images/rs-256.png",
  [K8SKind.PersistentVolume.toLowerCase()]: "/images/pv-256.png",
  [K8SKind.PersistentVolumeClaim.toLowerCase()]: "/images/pvc-256.png",
  mongodb: "/images/crd-u-256.png",
  mongodbcommunity: "/images/crd-u-256.png",
  mongodbopsmanager: "/images/crd-u-256.png",
  mongodbuser: "/images/user-256.png",
};

const isOperatorPod = (kRes: K8SResource) =>
  kRes.kind === K8SKind.Pod && kRes.name.includes("operator") && kRes.ownerReference?.kind === K8SKind.ReplicaSet;

const networkDataContainer = () => {
  const nodes: NetworkModels.Node[] = [];
  const edges: NetworkModels.Edge[] = [];

  const nodeTitle = (title: string) =>
    title
      .split("-")
      .reduce(
        (acc, w) => {
          if (acc[acc.length - 1].length + w.length < 18) {
            acc[acc.length - 1] += w + "-";
          } else {
            acc.push(w + "-");
          }
          return acc;
        },
        [""]
      )
      .join("\n")
      .slice(0, -1);

  return {
    addNode: (
      uid: string,
      label: string,
      tooltip: string,
      kind: string,
      edgeFromNodes: { uid: string; dashes?: boolean }[],
      edgeToNodes: { uid: string; dashes?: boolean }[]
    ) => {
      const image = ResourceImageMap[kind.toLowerCase()];
      const node = {
        id: uid,
        label: nodeTitle(label),
        title: tooltip,
        group: kind,
        shape: image ? "image" : undefined,
        image,
      };
      nodes.push(node);

      edgeFromNodes &&
        edges.push(...edgeFromNodes.map((e) => ({ from: e.uid, to: uid, dashes: e.dashes ? [3, 5] : undefined })));
      edgeToNodes &&
        edges.push(...edgeToNodes.map((e) => ({ from: uid, to: e.uid, dashes: e.dashes ? [3, 5] : undefined })));

      return node;
    },
    data: () => ({ nodes, edges }),
  };
};

const buildGraph = (settings: DisplaySettings, deployment: MongodbDeployment) => {
  const graph = networkDataContainer();

  deployment.k8sResources
    .filter((r) => !settings.HideResources.includes(r.kind))
    .forEach((kRes) => {
      graph.addNode(
        kRes.uid,
        kRes.name,
        `${kRes.kind}: ${kRes.name}${kRes.status ? ` - ${kRes.status}` : ""}`,
        isOperatorPod(kRes) ? "Operator" : kRes.kind,
        [
          { uid: kRes.ownerReference?.uid ?? "" },
          ...(kRes.dependsOnUIDs?.map((uid) => ({ uid, dashes: true })) ?? []),
        ].filter((e) => e.uid),
        []
      );
    });

  return graph.data();
};

const getNodeDetails = (data: MongodbDeploymentUIModel, uid?: string) => {
  const selectedNode = data.k8sResources.find((o) => o.uid === uid);
  if (!uid || !selectedNode) {
    return { title: "", sections: [] };
  }

  const sections = [
    {
      title: "Info",
      content: YAML.stringify(
        {
          uid: selectedNode.uid,
          name: selectedNode.name,
          kind: selectedNode.kind,
          namespace: selectedNode.namespace,
          status: selectedNode.status,
          creationTimestamp: new Date(selectedNode.creationTimestamp).toLocaleString(),
        },
        null,
        2
      ),
    },
  ];

  if (selectedNode.ownerReference?.uid && selectedNode.ownerReference.uid != "n/a") {
    sections.push({
      title: "Owner",
      content: YAML.stringify(
        {
          uid: selectedNode.ownerReference?.uid,
          kind: selectedNode.ownerReference?.kind,
          name: selectedNode.ownerReference?.name,
        },
        null,
        2
      ),
    });
  }

  if (selectedNode.spec) {
    sections.push({
      title: "Specs",
      content: YAML.stringify(selectedNode.spec, null, 2),
    });
  }

  return {
    title: `${selectedNode.name}`,
    sections,
    node: selectedNode,
  };
};

const Deployment = (props: DeploymentProps) => {
  const [selectedNodeUID, setSelectedNodeUID] = useState<string | undefined>(undefined);

  const nodeDetails = getNodeDetails(props.data, selectedNodeUID);

  return (
    <div style={{ height: "calc(100% - 64px)", backgroundColor: "white" }}>
      <NodeInfoModal
        show={!!selectedNodeUID}
        title={nodeDetails.title}
        node={{
          kind: nodeDetails.node?.kind ?? "",
          namespace: nodeDetails.node?.namespace ?? "",
          name: nodeDetails.node?.name ?? "",
        }}
        sections={nodeDetails.sections}
        actions={nodeDetails.node?.actions ?? []}
        onClose={() => setSelectedNodeUID(undefined)}
      />

      <div style={{ border: "1px solid darkgray", height: "100%" }}>
        <Network data={buildGraph(props.settings, props.data)} onSelectNode={setSelectedNodeUID} />
      </div>
    </div>
  );
};

export default Deployment;
