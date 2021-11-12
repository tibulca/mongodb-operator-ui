import { MongodbDeploymentUIModel } from "../../core/models";
import { getMongodbDeploymentWithActions } from "./deploymentActions";

export const getMongodbDeploymentNetwork = async (): Promise<MongodbDeploymentUIModel> => {
  const deployment = await getMongodbDeploymentWithActions();
  return {
    k8sResources: deployment.k8sResources.map((o) => ({
      ...o,
      ui: {
        location: { x: 0, y: 0 },
      },
    })),
  };
};
