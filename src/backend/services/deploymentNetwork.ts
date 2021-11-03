import { MongodbDeploymentUIModel } from "../../core/models";
import { getMongodbDeploymentWithActions } from "./deploymentActions";

export const getMongodbDeploymentNetwork = async (): Promise<MongodbDeploymentUIModel> => {
  const deployment = await getMongodbDeploymentWithActions();
  return {
    k8sObjects: deployment.k8sObjects.map((o) => ({
      ...o,
      ui: {
        location: { x: 0, y: 0 },
      },
    })),
  };
};
