import * as stream from "stream";
import * as k8s from "@kubernetes/client-node";
import { K8SKind } from "../../../core/enums";
import { K8SContext } from "../../../core/models";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const allClients = new Map(
  kc.getContexts().map((ctx) => {
    const conf = new k8s.KubeConfig();
    conf.loadFromDefault();
    conf.setCurrentContext(ctx.name);

    return [
      ctx.name,
      {
        k8sExec: new k8s.Exec(conf),
        k8sApi: conf.makeApiClient(k8s.CoreV1Api),
        k8sApiExt: conf.makeApiClient(k8s.ApiextensionsV1Api),
        k8sAppsApi: conf.makeApiClient(k8s.AppsV1Api),
        k8sCustomObjectsApi: conf.makeApiClient(k8s.CustomObjectsApi),
      },
    ];
  })
);

const clients = (context: string) => {
  const ctxClients = allClients.get(context);
  if (!ctxClients) {
    throw new Error(`invalid context "${context}"`);
  }
  return ctxClients;
};

const getContexts = (): { contexts: K8SContext[]; currentContext: string } => ({
  contexts: kc.getContexts(),
  currentContext: kc.getCurrentContext(),
});

const getPods = async (context: string, namespace: string) =>
  clients(context)
    .k8sApi.listNamespacedPod(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map(ensureKindIsSet(K8SKind.Pod)) }));

const deletePod = async (context: string, namespace: string, podName: string) =>
  clients(context)
    .k8sApi.deleteNamespacedPod(podName, namespace)
    .then((res) => res.body);

const readPodLogs = async (context: string, namespace: string, podName: string, container: string) =>
  clients(context)
    .k8sApi.readNamespacedPodLog(podName, namespace, container)
    .then((res) => res.body);

const execCmdInPod = (
  context: string,
  namespace: string,
  podName: string,
  container: string,
  command: string[]
): Promise<string> => {
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
    clients(context).k8sExec.exec(
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

const ensureKindIsSet =
  (defaultKind: K8SKind) =>
  <T extends { kind?: string }>(i: T) => ({
    ...i,
    kind: i.kind ?? defaultKind,
  });

// todo: set "kind" if not found in the response
const getDeployments = async (context: string, namespace: string) =>
  clients(context)
    .k8sAppsApi.listNamespacedDeployment(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map(ensureKindIsSet(K8SKind.Deployment)) }));

const getReplicaSets = async (context: string, namespace: string) =>
  clients(context)
    .k8sAppsApi.listNamespacedReplicaSet(namespace)
    .then((res) => ({ ...res.body, items: res.body.items.map(ensureKindIsSet(K8SKind.ReplicaSet)) }));

const getStatefulSets = async (context: string, namespace: string) =>
  clients(context)
    .k8sAppsApi.listNamespacedStatefulSet(namespace)
    .then((res) => ({
      ...res.body,
      items: res.body.items.map(ensureKindIsSet(K8SKind.StatefulSet)),
    }));

const getServices = async (context: string, namespace: string) =>
  clients(context)
    .k8sApi.listNamespacedService(namespace)
    .then((res) => ({
      ...res.body,
      items: res.body.items.map(ensureKindIsSet(K8SKind.Service)),
    }));

const getConfigMaps = async (context: string, namespace: string) =>
  clients(context)
    .k8sApi.listNamespacedConfigMap(namespace)
    .then((res) => ({
      ...res.body,
      items: res.body.items.map(ensureKindIsSet(K8SKind.ConfigMap)),
    }));

const getSecrets = async (context: string, namespace: string) =>
  clients(context)
    .k8sApi.listNamespacedSecret(namespace)
    .then((res) => ({
      ...res.body,
      items: res.body.items.map(ensureKindIsSet(K8SKind.Secret)),
    }));

const getCRDs = async (context: string, groups: Set<string>) =>
  clients(context)
    .k8sApiExt.listCustomResourceDefinition()
    .then((res) => res.body.items.filter((crd) => groups.has(crd.spec.group)));

const getCRs = async (
  context: string,
  group: string,
  version: string,
  namespace: string,
  plural: string
): Promise<any[]> =>
  clients(context)
    .k8sCustomObjectsApi.listNamespacedCustomObject(group, version, namespace, plural)
    .then((res) => <any[]>(<any>res.body).items);

const getPersistentVolumeClaims = async (context: string, namespace: string) =>
  clients(context)
    .k8sApi.listNamespacedPersistentVolumeClaim(namespace)
    .then((res) => ({
      ...res.body,
      items: res.body.items.map(ensureKindIsSet(K8SKind.PersistentVolumeClaim)),
    }));

const getPersistentVolumes = async (context: string) =>
  clients(context)
    .k8sApi.listPersistentVolume()
    .then((res) => ({
      ...res.body,
      items: res.body.items.map(ensureKindIsSet(K8SKind.PersistentVolume)),
    }));

export default {
  getContexts,
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
  getServices,
  getSecrets,
  getConfigMaps,
};
