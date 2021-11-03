import { V1ObjectMeta } from "@kubernetes/client-node";
import { K8SKind, MongoDBCRDGroupSet, MongoDBKindSet, MongoDbOperatorLabelSet } from "../../core/enums";
import { MongodbDeployment, K8SObject } from "../../core/models";
import k8sClient from "./clients/k8s";

const DefaultOperatorNamespace = "mongodb";

const mapK8SObjectWith = (kObj: { kind: string; metadata?: V1ObjectMeta; spec?: any }) => ({
  uid: kObj.metadata?.uid ?? "-",
  name: kObj.metadata?.name ?? "-",
  namespace: kObj.metadata?.namespace,
  ownerReference: kObj.metadata?.ownerReferences ? { uid: kObj.metadata?.ownerReferences[0].uid } : undefined,
  kind: kObj.kind,
  spec: kObj.spec,
  creationTimestamp: new Date(kObj.metadata?.creationTimestamp ?? 0).getTime(),
});

const crdUID = (name: string) => `crd-${name}`;

const getCRDsAndCRs = async () => {
  const k8sObjects: K8SObject[] = [];
  const crUIDs: string[] = [];
  let operatorNs = DefaultOperatorNamespace;

  const kCRDs = await k8sClient.getCRDs(MongoDBCRDGroupSet);
  for (const crd of kCRDs) {
    const kCRs = await k8sClient.getCRs(crd.spec.group, crd.spec.versions[0].name, "", crd.spec.names.plural);
    const mdbCR = kCRs.find((c) => MongoDBKindSet.has(c.kind));
    operatorNs = mdbCR?.metadata.namespace ?? operatorNs;

    k8sObjects.push({
      uid: crdUID(crd.spec.names.kind),
      name: crd.spec.names.kind,
      kind: K8SKind.CustomResourceDefinition,
      creationTimestamp: new Date(crd.metadata?.creationTimestamp ?? 0).getTime(),
    });

    const crK8SObjects = kCRs.map((c: any) => ({
      ...mapK8SObjectWith(c),
      ownerReference: { uid: crdUID(c.kind) },
      status: c.status?.phase,
    }));
    k8sObjects.push(...crK8SObjects);
    crUIDs.push(...crK8SObjects.map((o) => o.uid));
  }

  return { operatorNs, k8sObjects, crUIDs };
};

const getPods = async (namespace: string, crUIDs: string[]) => {
  const kPods = await k8sClient.getPods(namespace);

  const operatorPod = kPods.items.find((p) =>
    Object.values(p.metadata?.labels ?? {}).find((l) => MongoDbOperatorLabelSet.has(l))
  );

  const podObjects = kPods.items.map((kObj) => ({
    ...mapK8SObjectWith(kObj),
    dependsOnUIDs: kObj.metadata?.uid === operatorPod?.metadata?.uid ? crUIDs : undefined,
    status: kObj.status?.phase,
    childs: [
      ...(kObj.spec?.containers.map((c) => c.name) || []),
      ...(kObj.spec?.initContainers?.map((c) => c.name) || []),
    ],
  }));

  return {
    operatorPod,
    podObjects,
  };
};

export const getMongodbDeployment = async (): Promise<MongodbDeployment> => {
  const { k8sObjects, operatorNs, crUIDs } = await getCRDsAndCRs();

  const { operatorPod, podObjects } = await getPods(operatorNs, crUIDs);
  k8sObjects.push(...podObjects);

  const kDeployments = await k8sClient.getDeployments(operatorNs);
  k8sObjects.push(...kDeployments.items.map(mapK8SObjectWith));

  const kReplicaSets = await k8sClient.getReplicaSets(operatorNs);
  k8sObjects.push(...kReplicaSets.items.map(mapK8SObjectWith));

  const kStatefulSets = await k8sClient.getStatefulSets(operatorNs);
  k8sObjects.push(
    ...kStatefulSets.items.map((kObj) => ({
      ...mapK8SObjectWith(kObj),
      dependsOnUIDs: operatorPod?.metadata?.uid ? [operatorPod?.metadata?.uid] : [],
    }))
  );

  return {
    k8sObjects,
  };
};
