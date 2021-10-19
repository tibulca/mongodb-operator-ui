import React, { useState } from "react";
import YAML from "yaml";

import { MongodbDeployment } from "../../core/models";
import { NodeInfoModal } from "./node-info-modal";
import { Network } from "./network";
import * as NetworkModels from "../models/network";

type DeploymentProps = {
  data: MongodbDeployment;
};

const ResourceImageMap: Record<string, string> = {
  pod: "/images/pod-256.png",
  customresourcedefinition: "/images/crd-256.png",
  deployment: "/images/deploy-256.png",
  statefulset: "/images/sts-256.png",
  replicaset: "/images/rs-256.png",
  mongodb: "/images/crd-u-256.png",
};

const networkDataContainer = () => {
  const nodes: NetworkModels.Node[] = [];
  const edges: NetworkModels.Edge[] = [];

  return {
    addNode: (
      uid: string,
      label: string,
      tooltip: string,
      kind: string,
      edgeFromNodes?: { uid: string; dashes?: boolean }[],
      edgeToNodes?: { uid: string; dashes?: boolean }[]
    ) => {
      const image = ResourceImageMap[kind.toLowerCase()];
      const node = {
        id: uid,
        label: `<b>${label}</b>`,
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

const buildGraph = (deployment: MongodbDeployment) => {
  const graph = networkDataContainer();

  deployment.k8sObjects.forEach((kObj) => {
    graph.addNode(
      kObj.uid,
      kObj.name,
      `${kObj.kind}: ${kObj.name}${kObj.status ? ` - ${kObj.status}` : ""}`,
      kObj.kind,
      [
        { uid: kObj.ownerReference?.uid ?? "" },
        ...(kObj.dependsOnUIDs?.map((uid) => ({ uid, dashes: true })) ?? []),
      ].filter((e) => e.uid),
      []
    );
  });

  return graph.data();
};

const getNodeDetails = (data: MongodbDeployment, uid?: string) => {
  const selectedNode = data.k8sObjects.find((o) => o.uid === uid);
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
        },
        null,
        2
      ),
    },
  ];
  if (selectedNode.spec) {
    sections.push({
      title: "Specs",
      content: YAML.stringify(selectedNode.spec, null, 2),
    });
  }

  return {
    title: `${selectedNode.name}`,
    sections,
  };
};

const Deployment = (props: DeploymentProps) => {
  const [selectedNodeUID, setSelectedNodeUID] = useState<string | undefined>(undefined);

  const nodeDetails = getNodeDetails(props.data, selectedNodeUID);

  return (
    <div style={{ height: "calc(100% - 140px)", width: "100%", backgroundColor: "white" }}>
      <NodeInfoModal
        show={!!selectedNodeUID}
        title={nodeDetails.title}
        sections={nodeDetails.sections}
        onClose={() => setSelectedNodeUID(undefined)}
      />

      <div style={{ border: "1px solid darkgray", height: "100%" }}>
        <Network data={buildGraph(props.data)} onSelectNode={setSelectedNodeUID} />
      </div>
    </div>
  );
};

export default Deployment;
