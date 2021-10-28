import k8sClient from "./clients/k8s";

export const getPodLogs = async (namespace: string, pod: string, container: string) =>
  k8sClient.readPodLogs(namespace, pod);
