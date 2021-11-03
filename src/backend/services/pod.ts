import k8sClient from "./clients/k8s";

export const deletePod = async (namespace: string, pod: string) => k8sClient.deletePod(namespace, pod);

export const getPodLogs = async (namespace: string, pod: string, container: string) =>
  k8sClient.readPodLogs(namespace, pod, container);

export const getAgentHealtStatusFile = async (namespace: string, pod: string, container: string) => {
  const output = await k8sClient.execCmdInPod(namespace, pod, container, [
    "/bin/sh",
    "-c",
    "cat ${AGENT_STATUS_FILEPATH:-${MMS_LOG_DIR}/agent-health-status.json}",
  ]);

  return JSON.stringify(JSON.parse(output), null, 2);
};
