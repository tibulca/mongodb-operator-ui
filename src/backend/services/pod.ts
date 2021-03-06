import k8sClient from "./clients/k8s";

export const deletePod = async (context: string, namespace: string, pod: string) =>
  k8sClient.deletePod(context, namespace, pod);

export const getPodLogs = async (context: string, namespace: string, pod: string, container: string) =>
  k8sClient.readPodLogs(context, namespace, pod, container);

export const getAgentHealtStatusFile = async (context: string, namespace: string, pod: string, container: string) => {
  const command = ["/bin/sh", "-c", "cat ${AGENT_STATUS_FILEPATH:-${MMS_LOG_DIR}/agent-health-status.json}"];
  const output = await k8sClient.execCmdInPod(context, namespace, pod, container, command);

  return {
    namespace,
    pod,
    container,
    command: `kubectl -n ${namespace} exec -it ${pod} -c ${container} -- ${command
      .map((c) => `'${c}'`)
      .join(" ")} | jq`,
    docsRef: "todo: add link to documentation",
    agentHealthStatus: JSON.parse(output),
  };
};
