import { K8SKind, HttpMethod } from "../../core/enums";
import { K8SObject, MongodbDeploymentWithActions, NodeHttpAction } from "../../core/models";
import { getMongodbDeployment } from "./deployment";

const getActions = (o: K8SObject): NodeHttpAction[] => {
  const labelIsSameAsGroup = o.childs && o.childs.length > 1;

  switch (o.kind) {
    case K8SKind.Pod:
      return [
        ...(o.childs ?? []).map((container) => ({
          group: "logs",
          label: labelIsSameAsGroup ? container : "logs",
          description: `download logs ${o.namespace}/${o.name}:${container}`,
          url: `/api/pods/logs?namespace=${o.namespace}&pod=${o.name}&container=${container}`,
          httpMethod: HttpMethod.Get,
        })),
        {
          group: "delete",
          label: "delete",
          description: `delete pod ${o.namespace}/${o.name}`,
          url: `/api/pods?namespace=${o.namespace}&pod=${o.name}`,
          httpMethod: HttpMethod.Delete,
        },
      ];
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
