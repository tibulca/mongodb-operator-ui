import { MongodbDeployment, K8SObject } from "../../core/models";
import k8sClient from "./clients/k8s";

const CRDGroups = ["mongodb.com", "mongodbcommunity.mongodb.com"];

export const getMongodbDeployment = async (): Promise<MongodbDeployment> => {
  let operatorNs = "mongodb";

  const kCRDs = await k8sClient.getCRDs(CRDGroups);
  const k8sObjects: K8SObject[] = [];
  const allCRs: K8SObject[] = [];

  for (const crd of kCRDs) {
    const kCRs = await k8sClient.getCRs(crd.spec.group, crd.spec.versions[0].name, "", crd.spec.names.plural);
    const mdbCR = kCRs.find((c) => c.kind === "MongoDB" || c.kind === "MongoDBMulti" || c.kind === "MongoDBCommunity");
    operatorNs = mdbCR?.metadata.namespace ?? operatorNs;

    k8sObjects.push({
      uid: `crd-${crd.spec.names.kind}`,
      name: crd.spec.names.kind,
      kind: "CustomResourceDefinition",
    });

    const crs = kCRs.map((c: any) => ({
      uid: c.metadata.uid,
      name: c.metadata.name,
      kind: c.kind,
      namespace: c.metadata.namespace,
      ownerReference: {
        uid: `crd-${c.kind}`,
      },
      status: c.status?.phase,
      spec: c.spec,
    }));
    k8sObjects.push(...crs);
    allCRs.push(...crs);
  }

  const kPods = await k8sClient.getPods(operatorNs);
  const operatorPod = kPods.items.find((p) =>
    Object.values(p.metadata?.labels ?? {}).find((l) => l.includes("operator"))
  );

  kPods.items.forEach((kObj) =>
    // todo: this map can be done generic
    k8sObjects.push({
      uid: kObj.metadata?.uid ?? "-",
      kind: kObj.kind ?? "-",
      name: kObj.metadata?.name ?? "-",
      namespace: kObj.metadata?.namespace,
      ownerReference: kObj.metadata?.ownerReferences ? { uid: kObj.metadata?.ownerReferences[0].uid } : undefined,
      dependsOnUIDs: kObj.metadata?.uid === operatorPod?.metadata?.uid ? allCRs.map((c) => c.uid) : undefined,
      status: kObj.status?.phase,
      spec: kObj.spec,
    })
  );

  const kDeployments = await k8sClient.getDeployments(operatorNs);
  kDeployments.items.forEach((kObj) =>
    k8sObjects.push({
      uid: kObj.metadata?.uid ?? "-",
      kind: kObj.kind ?? "-",
      name: kObj.metadata?.name ?? "-",
      namespace: kObj.metadata?.namespace,
      ownerReference: kObj.metadata?.ownerReferences ? { uid: kObj.metadata?.ownerReferences[0].uid } : undefined,
      spec: kObj.spec,
    })
  );

  const kReplicaSets = await k8sClient.getReplicaSets(operatorNs);
  kReplicaSets.items.forEach((kObj) =>
    k8sObjects.push({
      uid: kObj.metadata?.uid ?? "-",
      kind: kObj.kind ?? "-",
      name: kObj.metadata?.name ?? "-",
      namespace: kObj.metadata?.namespace,
      ownerReference: kObj.metadata?.ownerReferences ? { uid: kObj.metadata?.ownerReferences[0].uid } : undefined,
      spec: kObj.spec,
    })
  );

  const kStatefulSets = await k8sClient.getStatefulSets(operatorNs);
  kStatefulSets.items.forEach((kObj) =>
    k8sObjects.push({
      uid: kObj.metadata?.uid ?? "-",
      kind: kObj.kind ?? "-",
      name: kObj.metadata?.name ?? "-",
      namespace: kObj.metadata?.namespace,
      ownerReference: kObj.metadata?.ownerReferences ? { uid: kObj.metadata?.ownerReferences[0].uid } : undefined,
      dependsOnUIDs: operatorPod?.metadata?.uid ? [operatorPod?.metadata?.uid] : [],
      spec: kObj.spec,
    })
  );

  return {
    k8sObjects,
  };
};
