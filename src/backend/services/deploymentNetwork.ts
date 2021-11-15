import { MongodbDeploymentUIModel } from "../../core/models";
import { getMongodbDeploymentWithActions } from "./deploymentActions";

export const getMongodbDeploymentNetwork = async (context: string): Promise<MongodbDeploymentUIModel> => {
  const deployment = await getMongodbDeploymentWithActions(context);
  return {
    k8sResources: deployment.k8sResources.map((o) => ({
      ...o,
      ui: {
        location: { x: 0, y: 0 },
      },
    })),
  };
};
