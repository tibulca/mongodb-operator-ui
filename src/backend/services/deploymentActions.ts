import { K8SKind, HttpMethod } from "../../core/enums";
import { K8SObject, MongodbDeploymentWithActions, NodeHttpAction } from "../../core/models";
import { getMongodbDeployment } from "./deployment";

const getActions = (o: K8SObject): NodeHttpAction[] => {
  const labelIsSameAsGroup = o.childs && o.childs.length > 1;

  switch (o.kind) {
    case K8SKind.Pod:
      const podActions = [
        ...(o.childs ?? []).map((container) => ({
          group: "logs",
          label: labelIsSameAsGroup ? container : "logs",
          description: `download logs ${o.namespace}/${o.name}:${container}`,
          url: `/api/pods/logs?namespace=${o.namespace}&pod=${o.name}&container=${container}`,
          httpMethod: HttpMethod.Get,
        })),
      ];
      const mdbContainer = o.childs && o.childs.find((c) => c === "mongod" || c === "mongodb-enterprise-database");
      if (mdbContainer) {
        podActions.push({
          group: "health",
          label: "agent health status",
          description: `agent health status ${o.namespace}/${o.name}:${mdbContainer}`,
          url: `/api/pods/agenthealth?namespace=${o.namespace}&pod=${o.name}&container=${mdbContainer}`,
          httpMethod: HttpMethod.Get,
        });
      }
      podActions.push({
        group: "delete",
        label: "delete",
        description: `delete pod ${o.namespace}/${o.name}`,
        url: `/api/pods?namespace=${o.namespace}&pod=${o.name}`,
        httpMethod: HttpMethod.Delete,
      });
      return podActions;
    default:
      return [];
  }
};

export const getMongodbDeploymentWithActions = async (): Promise<MongodbDeploymentWithActions> => {
  const deployment = await getMongodbDeployment();
  return {
    k8sObjects: deployment.k8sObjects.map((o) => ({ ...o, actions: getActions(o) })),
  };
};