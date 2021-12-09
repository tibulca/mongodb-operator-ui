import React, { useState } from "react";
import YAML from "yaml";

import NodeInfoDrawer from "./node-info-drawer";
import Network from "./network";
import * as NetworkModels from "../ui-models";
import { K8SKind, MongoDBKind, MongoDBKindSet } from "../../core/enums";
import { DisplaySettings, MongodbDeploymentUIModel } from "../ui-models";
import { isOperatorPod } from "../../core/utils";
import { toResourceUIStatus } from "../mappers";
import { ResourceUIStatus } from "../ui-enums";

type DeploymentProps = {
  data: MongodbDeploymentUIModel;
  settings: DisplaySettings;
};

const ResourceImageMap: Record<string, string> = {
  [K8SKind.Pod.toLowerCase()]: "/images/pod.svg",
  [K8SKind.CustomResourceDefinition.toLowerCase()]: "/images/crd.svg",
  [K8SKind.Deployment.toLowerCase()]: "/images/deploy.svg",
  [K8SKind.StatefulSet.toLowerCase()]: "/images/sts.svg",
  [K8SKind.ReplicaSet.toLowerCase()]: "/images/rs.svg",
  [K8SKind.PersistentVolume.toLowerCase()]: "/images/pv.svg",
  [K8SKind.PersistentVolumeClaim.toLowerCase()]: "/images/pvc.svg",
  [K8SKind.Service.toLowerCase()]: "/images/svc.svg",
  [K8SKind.ConfigMap.toLowerCase()]: "/images/cm.svg",
  [K8SKind.Secret.toLowerCase()]: "/images/secret.svg",

  [MongoDBKind.MongoDB.toLowerCase()]: "/images/crd-u.svg",
  [MongoDBKind.MongoDBCommunity.toLowerCase()]: "/images/crd-u.svg",
  [MongoDBKind.MongoDBOpsManager.toLowerCase()]: "/images/crd-u.svg",
  [MongoDBKind.MongoDBUser.toLowerCase()]: "/images/user.svg",
  [MongoDBKind.MongoDBOperator.toLowerCase()]: "/images/pod.svg",
};

const getResourceImage = (kRes: NetworkModels.ResourceUIModel, kind: K8SKind | MongoDBKind) => {
  const image = ResourceImageMap[kind.toLowerCase()];
  if (!image) {
    return undefined;
  }

  const uiStatus = toResourceUIStatus(kRes.status);
  return uiStatus !== ResourceUIStatus.NA && uiStatus !== ResourceUIStatus.Running
    ? image.replace(".svg", `-${uiStatus}.svg`)
    : image;
};

const networkDataContainer = () => {
  const nodes: NetworkModels.Node[] = [];
  const wrapperNodes: NetworkModels.Node[] = [];
  const edges: NetworkModels.Edge[] = [];

  const nodeTitle = (title: string, wordWrap: boolean, bold?: boolean) => {
    const withWordWrap = (t: string, sep: string) =>
      t
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
        .join(sep)
        .slice(0, -1);

    return `${bold ? "<b>" : ""}${wordWrap ? withWordWrap(title, bold ? "</b>\n<b>" : "\n") : title}${
      bold ? "</b>" : ""
    }`;
  };

  return {
    addNode: (kRes: NetworkModels.ResourceUIModel) => {
      const kind = isOperatorPod(kRes) ? MongoDBKind.MongoDBOperator : kRes.kind;
      const image = getResourceImage(kRes, kind);

      const isWrapper = kind === K8SKind.Namespace;
      const boldTitle = kRes.ui.font?.bold || MongoDBKindSet.has(kind as MongoDBKind);

      const node = {
        id: kRes.uid,
        label: nodeTitle(kRes.name, !isWrapper, boldTitle),
        title: `${kRes.kind}: ${kRes.name}${kRes.status ? ` - ${kRes.status}` : ""}`,
        group: kind,
        shape: image ? "image" : "box",
        image,
        font: kRes.ui.font?.size ? { size: kRes.ui.font.size } : undefined,
        opacity: isWrapper ? 0.2 : undefined,
        x: kRes.ui.location.x,
        y: kRes.ui.location.y,
        heightConstraint: kRes.ui.size ? { minimum: kRes.ui.size.height, valign: "top" } : undefined,
        widthConstraint: kRes.ui.size ? { minimum: kRes.ui.size.width } : undefined,
      };
      isWrapper ? wrapperNodes.push(node) : nodes.push(node);

      const edgeFromNodes: { uid: string; dashes?: boolean }[] = [
        { uid: kRes.ownerReference?.uid ?? "" },
        ...(kRes.dependsOnUIDs?.map((uid) => ({ uid, dashes: true })) ?? []),
      ].filter((e) => e.uid);
      edges.push(...edgeFromNodes.map((e) => ({ from: e.uid, to: kRes.uid, dashes: e.dashes ? [3, 5] : undefined })));

      // const edgeToNodes: { uid: string; dashes?: boolean }[] = [];
      // edgeToNodes &&
      //   edges.push(...edgeToNodes.map((e) => ({ from: kRes.uid, to: e.uid, dashes: e.dashes ? [3, 5] : undefined })));

      return node;
    },
    data: () => ({ nodes: [...wrapperNodes, ...nodes], edges }),
  };
};

const buildGraph = (deployment: MongodbDeploymentUIModel) => {
  const graph = networkDataContainer();
  deployment.resources.forEach(graph.addNode);
  return graph.data();
};

const getNodeDetails = (data: MongodbDeploymentUIModel, uid?: string) => {
  const selectedNode = data.resources.find((o) => o.uid === uid);
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

  if (selectedNode.fullStatus) {
    sections.push({
      title: "Status",
      content: YAML.stringify(selectedNode.fullStatus, null, 2),
    });
  }

  if (selectedNode.spec) {
    sections.push({
      title: "Specs",
      content: YAML.stringify(selectedNode.spec, null, 2),
    });
  }

  if (selectedNode.isGroup) {
    const groupResources = data.resourceGroups.get(selectedNode.uid) || [];
    sections.push({
      title: "Members",
      content: YAML.stringify(
        groupResources.map((r) => r.name),
        null,
        2
      ),
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
      <NodeInfoDrawer
        title={nodeDetails.title}
        node={{
          kind: nodeDetails.node?.kind ?? "",
          namespace: nodeDetails.node?.namespace ?? "",
          name: nodeDetails.node?.name ?? "",
        }}
        sections={nodeDetails.sections}
        actions={nodeDetails.node?.actions ?? []}
        docs={nodeDetails.node?.docs}
        onClose={() => setSelectedNodeUID(undefined)}
        open={!!selectedNodeUID}
        width={900}
      />

      <div style={{ border: "1px solid darkgray", height: "100%" }}>
        <Network data={buildGraph(props.data)} layout={props.settings.Layout} onSelectNode={setSelectedNodeUID} />
      </div>
    </div>
  );
};

export default Deployment;
