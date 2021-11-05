import * as stream from "stream";
import * as k8s from "@kubernetes/client-node";
import { K8SKind } from "../../../core/enums";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sExec = new k8s.Exec(kc);
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sApiExt = kc.makeApiClient(k8s.ApiextensionsV1Api);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCustomObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);

const getPods = async (namespace: string) =>
  k8sApi
    .listNamespacedPod(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? K8SKind.Pod })) }));

const deletePod = async (namespace: string, podName: string) =>
  k8sApi.deleteNamespacedPod(podName, namespace).then((res) => res.body);

const readPodLogs = async (namespace: string, podName: string, container: string) =>
  k8sApi.readNamespacedPodLog(podName, namespace, container).then((res) => res.body);

const execCmdInPod = (namespace: string, podName: string, container: string, command: string[]): Promise<string> => {
  //const wStream = new stream.Writable();
  let output = "";

  const rwStream = new stream.Transform({
    transform(chunk, encoding, callback) {
      output = `${output}${chunk.toString()}`;
      this.push(chunk);
      callback();
    },
  });

  return new Promise((resolve, reject) => {
    k8sExec.exec(
      namespace,
      podName,
      container,
      command,
      //process.stdout as stream.Writable,
      rwStream,
      //process.stderr as stream.Writable,
      rwStream,
      process.stdin as stream.Readable,
      true /* tty */,
      (status: k8s.V1Status) => {
        if (status.status === "Success") {
          resolve(output);
        } else {
          reject(status);
        }
      }
    );
  });
};

// todo: set "kind" if not found in the response
const getDeployments = async (namespace: string) =>
  k8sAppsApi
    .listNamespacedDeployment(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? K8SKind.Deployment })) }));

const getReplicaSets = async (namespace: string) =>
  k8sAppsApi
    .listNamespacedReplicaSet(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? K8SKind.ReplicaSet })) }));

const getStatefulSets = async (namespace: string) =>
  k8sAppsApi.listNamespacedStatefulSet(namespace).then((res) => ({
    ...res.body,
    items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? K8SKind.StatefulSet })),
  }));

const getCRDs = async (groups: Set<string>) =>
  k8sApiExt.listCustomResourceDefinition().then((res) => res.body.items.filter((crd) => groups.has(crd.spec.group)));

const getCRs = async (group: string, version: string, namespace: string, plural: string): Promise<any[]> =>
  k8sCustomObjectsApi
    .listNamespacedCustomObject(group, version, namespace, plural)
    .then((res) => <any[]>(<any>res.body).items);

const getPersistentVolumeClaims = async (namespace: string) =>
  k8sApi.listNamespacedPersistentVolumeClaim(namespace).then((res) => ({
    ...res.body,
    items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? K8SKind.PersistentVolumeClaim })),
  }));

const getPersistentVolumes = async () =>
  k8sApi.listPersistentVolume().then((res) => ({
    ...res.body,
    items: res.body.items.map((i) => ({ ...i, kind: i.kind ?? K8SKind.PersistentVolume })),
  }));

export default {
  getPods,
  getDeployments,
  getReplicaSets,
  getStatefulSets,
  getCRDs,
  getCRs,
  deletePod,
  readPodLogs,
  execCmdInPod,
  getPersistentVolumeClaims,
  getPersistentVolumes,
};
