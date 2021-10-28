import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sApiExt = kc.makeApiClient(k8s.ApiextensionsV1Api);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCustomObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);

const getPods = async (namespace: string) =>
  k8sApi
    .listNamespacedPod(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? "Pod" })) }));

const readPodLogs = async (namespace: string, podName: string) =>
  k8sApi.readNamespacedPodLog(podName, namespace).then((res) => res.body);

// todo: set "kind" if not found in the response
const getDeployments = async (namespace: string) =>
  k8sAppsApi
    .listNamespacedDeployment(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? "Deployment" })) }));

const getReplicaSets = async (namespace: string) =>
  k8sAppsApi
    .listNamespacedReplicaSet(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? "ReplicaSet" })) }));

const getStatefulSets = async (namespace: string) =>
  k8sAppsApi
    .listNamespacedStatefulSet(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? "StatefulSet" })) }));

const getCRDs = async (group: string) =>
  k8sApiExt.listCustomResourceDefinition().then((res) => res.body.items.filter((crd) => crd.spec.group === group));

const getCRs = async (group: string, version: string, namespace: string, plural: string): Promise<any[]> =>
  k8sCustomObjectsApi
    .listNamespacedCustomObject(group, version, namespace, plural)
    .then((res) => <any[]>(<any>res.body).items);

export default {
  getPods,
  getDeployments,
  getReplicaSets,
  getStatefulSets,
  getCRDs,
  getCRs,
  readPodLogs,
};
