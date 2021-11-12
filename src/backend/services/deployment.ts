import { V1ObjectMeta } from "@kubernetes/client-node";
import { K8SKind, MongoDBCRDGroupSet, MongoDBKind, MongoDBKindSet, MongoDbOperatorLabelSet } from "../../core/enums";
import { MongodbDeployment, K8SResource } from "../../core/models";
import k8sClient from "./clients/k8s";

const DefaultOperatorNamespace = "mongodb";

const mapK8SResourceWith = (kObj: { kind: string; metadata?: V1ObjectMeta; spec?: any }) => ({
  uid: kObj.metadata?.uid ?? "n/a",
  name: kObj.metadata?.name ?? "n/a",
  namespace: kObj.metadata?.namespace,
  ownerReference: kObj.metadata?.ownerReferences
    ? {
        uid: kObj.metadata?.ownerReferences[0].uid,
        kind: kObj.metadata?.ownerReferences[0].kind as MongoDBKind | K8SKind,
        name: kObj.metadata?.ownerReferences[0].name,
      }
    : undefined,
  kind: kObj.kind as MongoDBKind | K8SKind,
  spec: kObj.spec,
  creationTimestamp: new Date(kObj.metadata?.creationTimestamp ?? 0).getTime(),
});

const crdUID = (name: string) => `crd-${name}`;

const getCRDsAndCRs = async () => {
  const k8sResources: K8SResource[] = [];
  const crUIDs: string[] = [];
  let operatorNs = DefaultOperatorNamespace;

  const kCRDs = await k8sClient.getCRDs(MongoDBCRDGroupSet);
  for (const crd of kCRDs) {
    const kCRs = await k8sClient.getCRs(crd.spec.group, crd.spec.versions[0].name, "", crd.spec.names.plural);
    const mdbCR = kCRs.find((c) => MongoDBKindSet.has(c.kind));
    operatorNs = mdbCR?.metadata.namespace ?? operatorNs;

    k8sResources.push({
      uid: crdUID(crd.spec.names.kind),
      name: crd.spec.names.kind,
      kind: K8SKind.CustomResourceDefinition,
      creationTimestamp: new Date(crd.metadata?.creationTimestamp ?? 0).getTime(),
    });

    const crK8SResources = kCRs.map((c: any) => ({
      ...mapK8SResourceWith(c),
      ownerReference: { uid: crdUID(c.kind), kind: K8SKind.CustomResourceDefinition, name: c.kind },
      status: c.status?.phase,
    }));
    k8sResources.push(...crK8SResources);
    crUIDs.push(...crK8SResources.map((o) => o.uid));
  }

  return { operatorNs, k8sResources: k8sResources, crUIDs };
};

const getPods = async (namespace: string, crUIDs: string[]) => {
  const kPods = await k8sClient.getPods(namespace);

  const operatorPod = kPods.items.find((p) =>
    Object.values(p.metadata?.labels ?? {}).find((l) => MongoDbOperatorLabelSet.has(l))
  );

  const podResources = kPods.items.map((kObj) => ({
    ...mapK8SResourceWith(kObj),
    dependsOnUIDs: kObj.metadata?.uid === operatorPod?.metadata?.uid ? crUIDs : undefined,
    status: kObj.status?.phase,
    childs: [
      ...(kObj.spec?.containers.map((c) => c.name) || []),
      ...(kObj.spec?.initContainers?.map((c) => c.name) || []),
    ],
    pvcs: kObj.spec?.volumes?.map((v) => v.persistentVolumeClaim?.claimName ?? "").filter((pvc) => pvc) || [],
    secrets: kObj.spec?.volumes?.map((v) => v.secret?.secretName ?? "").filter((s) => s) || [],
    configMaps: kObj.spec?.volumes?.map((v) => v.configMap?.name ?? "").filter((cf) => cf) || [],
  }));

  return {
    operatorPod,
    podResources,
  };
};

export const getMongodbDeployment = async (): Promise<MongodbDeployment> => {
  const { k8sResources, operatorNs, crUIDs } = await getCRDsAndCRs();

  const { operatorPod, podResources } = await getPods(operatorNs, crUIDs);
  k8sResources.push(...podResources);

  const kDeployments = await k8sClient.getDeployments(operatorNs);
  k8sResources.push(...kDeployments.items.map(mapK8SResourceWith));

  const kReplicaSets = await k8sClient.getReplicaSets(operatorNs);
  k8sResources.push(...kReplicaSets.items.map(mapK8SResourceWith));

  const kStatefulSets = await k8sClient.getStatefulSets(operatorNs);
  k8sResources.push(
    ...kStatefulSets.items.map((kObj) => ({
      ...mapK8SResourceWith(kObj),
      dependsOnUIDs: operatorPod?.metadata?.uid ? [operatorPod?.metadata?.uid] : [],
    }))
  );

  const kPVCs = await k8sClient.getPersistentVolumeClaims(operatorNs);
  k8sResources.push(
    ...kPVCs.items.map((kObj) => {
      const ownerPod = podResources.find((p) => p.pvcs.includes(kObj.metadata?.name ?? "n/a"));
      return {
        ...mapK8SResourceWith(kObj),
        ownerReference: {
          uid: ownerPod?.uid ?? "n/a",
          kind: ownerPod ? K8SKind.Pod : K8SKind.NA,
          name: ownerPod?.name ?? "n/a",
        },
      };
    })
  );

  const kPVs = await k8sClient.getPersistentVolumes();
  k8sResources.push(
    ...kPVs.items.map((kObj) => ({
      ...mapK8SResourceWith(kObj),
      ownerReference: {
        uid: kObj.spec?.claimRef?.uid ?? "n/a",
        kind: (kObj.spec?.claimRef?.kind as K8SKind) ?? K8SKind.NA,
        name: kObj.spec?.claimRef?.name ?? "n/a",
      },
    }))
  );

  return {
    k8sResources: k8sResources,
  };
};
