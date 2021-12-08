import { V1ObjectMeta } from "@kubernetes/client-node";
import {
  K8SKind,
  MongoDBCRDGroupSet,
  MongoDBKind,
  MongoDBKindSet,
  MongoDbOperatorLabelSet,
  ResourceStatus,
} from "../../core/enums";
import { MongodbDeployment, K8SResource } from "../../core/models";
import k8sClient from "./clients/k8s";

const DefaultOperatorNamespace = "mongodb";

type KResourceBase = {
  kind: string;
  metadata?: V1ObjectMeta;
  spec?: any;
  status?: any;
};

const mapK8SResourceWith = (kRes: KResourceBase) => ({
  uid: kRes.metadata?.uid ?? "n/a",
  name: kRes.metadata?.name ?? "n/a",
  namespace: kRes.metadata?.namespace,
  ownerReference: kRes.metadata?.ownerReferences
    ? {
        uid: kRes.metadata?.ownerReferences[0].uid,
        kind: kRes.metadata?.ownerReferences[0].kind as MongoDBKind | K8SKind,
        name: kRes.metadata?.ownerReferences[0].name,
      }
    : undefined,
  kind: kRes.kind as MongoDBKind | K8SKind,
  spec: kRes.spec,
  creationTimestamp: new Date(kRes.metadata?.creationTimestamp ?? 0).getTime(),
  status: kRes.metadata?.deletionTimestamp ? ResourceStatus.Terminating : kRes.status?.phase,
  fullStatus: kRes.status,
  labels: kRes.metadata?.labels,
});

const crdUID = (name: string) => `crd-${name}`;

const getCRDsAndCRs = async (context: string) => {
  const crdsAndCrs: K8SResource[] = [];
  const crUIDs: string[] = [];
  let operatorNs =
    k8sClient.getContexts().contexts.find((c) => c.name === context)?.namespace || DefaultOperatorNamespace;

  const kCRDs = await k8sClient.getCRDs(context, MongoDBCRDGroupSet);
  for (const crd of kCRDs) {
    const kCRs = await k8sClient.getCRs(context, crd.spec.group, crd.spec.versions[0].name, "", crd.spec.names.plural);
    const mdbCR = kCRs.find((c) => MongoDBKindSet.has(c.kind));
    operatorNs = mdbCR?.metadata.namespace ?? operatorNs;

    crdsAndCrs.push({
      uid: crdUID(crd.spec.names.kind),
      name: crd.spec.names.kind,
      kind: K8SKind.CustomResourceDefinition,
      creationTimestamp: new Date(crd.metadata?.creationTimestamp ?? 0).getTime(),
      spec: crd.spec,
      fullStatus: crd.status,
      labels: crd.metadata?.labels,
    });

    const crK8SResources = kCRs.map((c: any) => ({
      ...mapK8SResourceWith(c),
      ownerReference: { uid: crdUID(c.kind), kind: K8SKind.CustomResourceDefinition, name: c.kind },
    }));
    crdsAndCrs.push(...crK8SResources);
    crUIDs.push(...crK8SResources.map((o) => o.uid));
  }

  return { operatorNs, crdsAndCrs, crUIDs };
};

const getPods = async (context: string, namespace: string, crUIDs: string[]) => {
  const kPods = await k8sClient.getPods(context, namespace);

  const operatorPod = kPods.items.find((p) =>
    Object.entries(p.metadata?.labels ?? {}).find(
      ([k, v]) => (k === "app.kubernetes.io/instance" || k === "name") && MongoDbOperatorLabelSet.has(v)
    )
  );

  const podResources = kPods.items.map((kObj) => ({
    ...mapK8SResourceWith(kObj),
    dependsOnUIDs: kObj.metadata?.uid === operatorPod?.metadata?.uid ? crUIDs : undefined,
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

const getDeployments = async (context: string, operatorNs: string): Promise<K8SResource[]> => {
  const kDeployments = await k8sClient.getDeployments(context, operatorNs);
  return kDeployments.items.map(mapK8SResourceWith);
};

const getReplicaSets = async (context: string, operatorNs: string): Promise<K8SResource[]> => {
  const kReplicaSets = await k8sClient.getReplicaSets(context, operatorNs);
  return kReplicaSets.items.map(mapK8SResourceWith);
};

const getServices = async (
  context: string,
  operatorNs: string,
  dependentRes: K8SResource[]
): Promise<K8SResource[]> => {
  const kServices = await k8sClient.getServices(context, operatorNs);
  return kServices.items.map((kSvc) => {
    const svc = mapK8SResourceWith(kSvc);
    const svcSelector = kSvc.spec?.selector?.app;
    return {
      ...svc,
      dependsOnUIDs: dependentRes.filter((r) => r.spec.selector?.matchLabels?.app === svcSelector).map((r) => r.uid),
    };
  });
};

const getSecrets = async (context: string, operatorNs: string, dependentRes: K8SResource[]): Promise<K8SResource[]> => {
  const kSecrets = await k8sClient.getSecrets(context, operatorNs);
  return kSecrets.items.map((kSecret) => {
    const secret = mapK8SResourceWith(kSecret);
    const secretName = kSecret.metadata?.name;
    return {
      ...secret,
      dependsOnUIDs: dependentRes
        .filter((r) => {
          const resVolumes = r.spec.template?.spec?.volumes as { secret?: { secretName: string } }[];
          return resVolumes && resVolumes.find((v) => v.secret?.secretName === secretName);
        })
        .map((r) => r.uid),
    };
  });
};

const getStatefulSets = async (
  context: string,
  operatorNs: string,
  operatorPod?: KResourceBase
): Promise<K8SResource[]> => {
  const kStatefulSets = await k8sClient.getStatefulSets(context, operatorNs);
  return kStatefulSets.items.map((kObj) => ({
    ...mapK8SResourceWith(kObj),
    dependsOnUIDs: operatorPod?.metadata?.uid ? [operatorPod?.metadata?.uid] : [],
  }));
};

const getPersistentVolumeClaims = async (
  context: string,
  operatorNs: string,
  podResources: (K8SResource & { pvcs: string[] })[]
): Promise<K8SResource[]> => {
  const kPVCs = await k8sClient.getPersistentVolumeClaims(context, operatorNs);
  return kPVCs.items.map((kObj) => {
    const ownerPod = podResources.find((p) => p.pvcs.includes(kObj.metadata?.name ?? "n/a"));
    return {
      ...mapK8SResourceWith(kObj),
      ownerReference: {
        uid: ownerPod?.uid ?? "n/a",
        kind: ownerPod ? K8SKind.Pod : K8SKind.NA,
        name: ownerPod?.name ?? "n/a",
      },
    };
  });
};

const getPersistentVolumes = async (context: string): Promise<K8SResource[]> => {
  const kPVs = await k8sClient.getPersistentVolumes(context);

  return kPVs.items.map((kObj) => ({
    ...mapK8SResourceWith(kObj),
    ownerReference: {
      uid: kObj.spec?.claimRef?.uid ?? "n/a",
      kind: (kObj.spec?.claimRef?.kind as K8SKind) ?? K8SKind.NA,
      name: kObj.spec?.claimRef?.name ?? "n/a",
    },
  }));
};

export const getMongodbDeployment = async (context: string): Promise<MongodbDeployment> => {
  const { crdsAndCrs, operatorNs, crUIDs } = await getCRDsAndCRs(context);

  const { operatorPod, podResources } = await getPods(context, operatorNs, crUIDs);

  const [deployments, replicaSets, statefulSets, pvcs, pvs] = await Promise.all([
    getDeployments(context, operatorNs),
    getReplicaSets(context, operatorNs),
    getStatefulSets(context, operatorNs, operatorPod),
    getPersistentVolumeClaims(context, operatorNs, podResources),
    getPersistentVolumes(context),
  ]);

  const stsAndDeployments = [...deployments, ...statefulSets];
  const [services, secrets] = await Promise.all([
    getServices(context, operatorNs, stsAndDeployments),
    getSecrets(context, operatorNs, stsAndDeployments),
  ]);

  return {
    clusters: [
      {
        cluster: context,
        namespace: operatorNs,
        k8sResources: [
          ...crdsAndCrs,
          ...podResources,
          ...deployments,
          ...replicaSets,
          ...statefulSets,
          ...pvcs,
          ...pvs,
          ...services,
          ...secrets,
        ],
      },
    ],
  };
};
