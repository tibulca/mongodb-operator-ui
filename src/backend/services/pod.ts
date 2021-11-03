import k8sClient from "./clients/k8s";

export const deletePod = async (namespace: string, pod: string) => k8sClient.deletePod(namespace, pod);

export const getPodLogs = async (namespace: string, pod: string, container: string) =>
  k8sClient.readPodLogs(namespace, pod, container);
