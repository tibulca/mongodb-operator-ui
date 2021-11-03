import { K8SKind, HttpMethod } from "../../core/enums";
import { K8SObject, MongodbDeploymentWithActions } from "../../core/models";
import { getMongodbDeployment } from "./deployment";

const getActions = (o: K8SObject) => {
  switch (o.kind) {
    case K8SKind.Pod:
      return [
        ...(o.childs ?? []).map((container) => ({
          group: "logs",
          label: "logs",
          url: `/api/pods/logs?namespace=${o.namespace}&pod=${o.name}&container=${container}`,
          httpMethod: HttpMethod.Get,
        })),
        {
          group: "delete",
          label: "delete",
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
